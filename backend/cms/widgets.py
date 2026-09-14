import json

from django import forms


class FeatureListWidget(forms.Widget):
    """
    Renders a <textarea> where each line is one feature. Serializes to/from:
        {"features": ["Feature 1", "Feature 2", ...]}
    """

    template_name = "widgets/feature_list.html"

    def __init__(self, attrs=None):
        default_attrs = {
            "rows": 6,
            "class": "feature-list-input",
            "placeholder": (
                "Type each feature on a new line. For example:\n"
                "Chat with AI assistant\n"
                "Generate up to 100 images per month\n"
                "5 GB secure cloud storage\n"
                "Priority email support"
            ),
        }
        if attrs:
            default_attrs.update(attrs)
        super().__init__(default_attrs)

    # ---- DB -> HTML (render) ----
    def format_value(self, value):
        if not value:
            return ""
        # Already a dict/list from model
        if isinstance(value, dict):
            features = value.get("features", [])
        elif isinstance(value, list):
            features = value
        else:
            # Raw string — try to parse
            try:
                parsed = json.loads(value)
                features = parsed.get("features", []) if isinstance(parsed, dict) else parsed
            except TypeError, ValueError:
                return str(value)
        if not isinstance(features, list):
            return ""
        return "\n".join(str(f) for f in features)

    # ---- HTML -> Python (save) ----
    def value_from_datadict(self, data, files, name):
        raw = data.get(name, "")
        lines = [line.strip() for line in raw.splitlines() if line.strip()]
        return json.dumps({"features": lines})


class HumanSizeWidget(forms.MultiWidget):
    """
    Renders two inputs side-by-side:
      [ number ]  [ unit dropdown ]
    Combines them into a single byte value for the model.
    """

    UNITS = [
        ("B", 1),
        ("KB", 1024),
        ("MB", 1024**2),
        ("GB", 1024**3),
    ]

    def __init__(self, attrs=None):
        widgets = [
            forms.NumberInput(
                attrs={
                    "class": "size-number",
                    "placeholder": "e.g. 25",
                    "min": "0",
                    "step": "any",
                }
            ),
            forms.Select(
                attrs={"class": "size-unit"},
                choices=[(u[0], u[0]) for u in self.UNITS],
            ),
        ]
        super().__init__(widgets, attrs)

    def decompress(self, value):
        """
        Takes the DB byte value and splits it into (number, unit).
        Picks the largest unit that yields a whole-ish number.
        """
        if value in (None, ""):
            return [None, "MB"]

        try:
            bytes_val = int(value)
        except TypeError, ValueError:
            return [None, "MB"]

        if bytes_val == 0:
            return [0, "MB"]

        # Choose the best unit
        for unit, factor in reversed(self.UNITS):
            if bytes_val >= factor and bytes_val % factor == 0:
                return [bytes_val // factor, unit]

        # Fallback — largest unit that fits
        for unit, factor in reversed(self.UNITS):
            if bytes_val >= factor:
                qty = round(bytes_val / factor, 2)
                if qty.is_integer():
                    qty = int(qty)
                return [qty, unit]

        return [bytes_val, "B"]


class HumanSizeField(forms.MultiValueField):
    """
    Combines (number, unit) into a single integer byte value.
    """

    def __init__(self, *args, **kwargs):
        fields = (
            forms.DecimalField(
                min_value=0,
                required=False,
                error_messages={"invalid": "Enter a valid number."},
            ),
            forms.ChoiceField(
                choices=[(u[0], u[0]) for u in HumanSizeWidget.UNITS],
                required=False,
            ),
        )
        kwargs.setdefault("require_all_fields", False)
        kwargs.setdefault("required", False)
        super().__init__(fields=fields, *args, **kwargs)

    def compress(self, data_list):
        """
        Convert (number, unit) -> bytes (int).
        """
        if not data_list or data_list[0] in (None, ""):
            return None

        try:
            qty = float(data_list[0])
        except TypeError, ValueError:
            return None

        unit = (data_list[1] or "MB").upper()
        factor = dict(HumanSizeWidget.UNITS).get(unit, 1)

        return int(qty * factor)
