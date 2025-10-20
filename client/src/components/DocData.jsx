import {
  FaCrown,
  FaBolt,
  FaServer,
  FaCogs,
  FaDatabase,
  FaTools,
  FaUserLock,
} from 'react-icons/fa'

export const docsSections = [
  {
    id: 'overview',
    title: 'Overview',
    icon: FaCogs,
    content: `
    N-Drive is a file management platform  built with React + Django REST.It includes secure uploads, AI chat, and dynamic user plans.User can upload their files and create folder to organize the files.I added feature to share the uploaded file of one user to other using a unique link which auto generates when uploading a file. Folder also have same feature and be downloaded as zip file.Also This project have Ai integrated via API to chat and img Gen. You can read about it in Ai integration section.`,
  },
  {
    id: 'frontend',
    title: 'Frontend Architecture',
    icon: FaBolt,
    content: `
    The frontend of N-Drive is built br ReactJs,Library of Javascript released by Facebook. Why use React? because it have a bunch of functions like Virtual DOM, Components, JSX, One way data binding, Scalable, Flexible, Modular.I used functional components alongside react hooks like usestate, useeffect, useref etc. For the communication through api to backend i used axios package.the folder structure is a bit messy cause im a fresher you know<3.`,
  },
  {
    id: 'backend',
    title: 'Backend (Django REST)',
    icon: FaServer,
    content: `The server side/backend of NDrive is done by Django which is a framework of python,a fast and better server side  or full stack framework for web development.The main benefits of django i saw is everything is predefined in django. Like when i give my field and its type in models.py ,django auto creates sql command to match the db model i gave and make it,reducing my time to type and enter sql commands to create and define tables and rows.By with Django rest framework , Django gives predefined auth,data serializing etc and etc.I used python package like zipfile,cryptography(to encrypt chat with ai bot),request etc. I also used Jwt for Auth,check Authentication section for more.`,
  },
  {
    id: 'database',
    title: 'Database Models',
    icon: FaDatabase,
    content: `
    Database is one of the main part of N-Drive, and every app there is.In development,I used django default db.sqlite for database.I used supabase free trial for db in production.the main table in db include User,Package,Files,Folders etc.`,
  },

  {
    id: 'authentication',
    title: 'Authentication',
    icon: FaUserLock,
    content: `
    N-Drive uses Jwt authentication using django.The package rest_framework_simplejwt of python django make implementing auth with jwt simpler in django.JWT or json web token is auth method which gives access and refresh token when auth is success.Access token is send to backend in each response as header and if access token is expired ,we use refresh token to renew the access token.(this is done via protected route and auth context in frontend).`,
  },

  {
    id: 'payment',
    title: 'Payment & Packages',
    icon: FaCrown,
    content: `
N-Drive has paid packages to upgrade the storage and make ai chat & image generation available.This is done via mock payment login in django and also mock Payment in frontend also.The payment check the orderId generated in Payment initiate and return status of payment.`,
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    icon: FaTools,
    content: `
TroubleShoot Includes:
    1)File upload failing? Check package limits.
    2)AI not responding? Verify access.
    3)Nothing shows up? Check if backend service is active
    4)Another errors not listed here? Check and use Devtools of your browser like console,network etc`,
  },
]
