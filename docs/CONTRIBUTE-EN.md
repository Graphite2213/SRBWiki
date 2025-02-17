Hello! This is a slightly less formal document where I will provide some basic information about this repository, how the entire site functions, and how you can contribute to the development of the site. If you just want to write and edit pages, the documentation for that is HERE.

## Basic Information

The wiki itself is fully hosted on CloudFlare services, which include: one R1 bucket for storing pages and other data such as history, one worker for operations related to pages and users, and one pages instance for routing.

The pages instance tracks all changes to the master branch of this repository, except for documentation changes, meaning every successful PR automatically becomes part of the site.

The only other branch in the repository is `dev`, for which I do not guarantee any maintenance, good commit messages, etc., as it is solely for testing purposes.

## Site

The site is made in plain HTML, CSS, and JS. For anyone with any web development experience, this is a very strange choice, but I started the project with much lower expectations and scope in mind, and I didn’t want to delay it further by switching to a specific framework. Of course, if the site is used, I plan to migrate everything to Next.js, but for now, this is sufficient.

In essence, this has no impact on the functionality of the site, but it makes development and other people’s contributions to the code much harder.

As for contributions, if you’re interested, I have nothing against it, but I cannot guarantee that the current code is readable and easy to edit. A refactoring is long overdue even without switching to a framework, and I apologize in advance for any trouble this project may cause you 😅. The entry point for JavaScript is `index.js`, and in the `Elements` folder, you will find the elements used in writing articles on the site.
