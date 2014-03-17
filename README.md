Nipponline
==========

##About the project

Nipponline is a japanese course made up by several web applications that help the users learn the language while they enjoy themselves, instead of only reading boring theory online. Also, these applications will be linked to an online community where all the users can interact with each other, not only by speaking but by sharing and comparing results on all of the applications.

We have been interested in learning japanese for a long time, and there are a lot of resources online to do so, but each was different and we couldn not manage to actually learn something. Nipponline's goal is to gather each and every one of these resources into one site and make the user learn japanese while he has fun.
The project is not only made to learn japanese, but also to introduce some of the japanese culture to the users.

##Why did we start this project?

As said before, we wanted to learn this language for a long time, and also provide a way to allow othe people learn it. Besides, this project allow us to improve our knowledge about technologies that are very interesting, such as JavaScript, HTML5, PhoneGap or MongoDB.

##JavaScript + Node.js

Since we have to make all the applications online, we had to think a lot about what language to use. We decided to use Javascript for many reasons, being the most important that it is similar to what we already know and it is a very strong language in every aspect. Also, we decided to use Node.js because we wanted to have a total control over our web and it was closely related to JavaScript, so it was an obvious choice. This, combined with HTML5, will help us to develop interesting applications.

##MongoDB as database

Last but not least, we needed to decide a data base. We have ve been studying SQL for a long time and we thought that choosing a NoSQL would be the best option for our 'learning new technologies' policy. But there is a lot of different data bases in the NoSQL range of data bases, since they differ more from one to another than the SQL ones. We decided to use MongoDB since it fit with all of our requirements for a data base and it has proven to be a growing data base lately. Also, the fact that its files have a JSON structure, that works really well with Javascript and Node.js, made it obvious for us.

##Requirements

* [Node.js](http://nodejs.org/ "Node.js"), version 0.10 or greater.
* [MongoDB](https://www.mongodb.org/ "MongoDB"), version 2.4.8 or greater.
* [NodeBB](http://www.nodebb.org/ "NodeBB"). Only if intending to log in the applications and save game stats.

Create a database with the data provide in the 'database' folder of this project, as well as a user with read privileges.This will allow users to play the applications as annonymous. In order to log in the applications and save game stats it is necessary to install [NodeBB](http://www.nodebb.org/ "NodeBB") and use the same session secret.

##How to install

First, create a database in MongoDB with the data provide in the 'database' folder of this project, as well as a user with read privileges. If NodeBB is installed, provide the same session secret in config.json and a user with read and write privileges.

Run:

1. npm install -g grunt-cli
2. npm install
3. You may need to do 'npm install' for some modules
4. grunt init:dev
5. grunt server

##License

All the code developed by Nipponline team is under the GPLv3 license.

All the creative assets used in this project are under the [Creative Commons
Attribution-NonCommercial-ShareAlike 4.0 International
License](http://creativecommons.org/licenses/by-nc-sa/4.0/).

![CC-BY-NC-SA](http://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png)
