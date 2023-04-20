import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://samuelgunter.com",
  author: "Samuel Gunter",
  desc: "Blog and portfolio of a web and software developer",
  title: "samuelgunter.com",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerPage: 3,
};

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
};

export const RESUME_LINK =
  "https://docs.google.com/document/d/1UF9FiTTjyCFgIuJQNXqJZc_P6-1aJlZqSqscW0KQ2yw/edit?usp=sharing";

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/samathingamajig",
    linkTitle: ` ${SITE.author} on Github`,
    active: true,
  },
  {
    name: "Twitter",
    href: "https://twitter.com/samathingamajig",
    linkTitle: `${SITE.author} on Twitter`,
    active: true,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/samuel-gunter/",
    linkTitle: `${SITE.author} on LinkedIn`,
    active: true,
  },
  {
    name: "Mail",
    href: "mailto:samathingamajig@gmail.com",
    linkTitle: `Send an email to ${SITE.author}`,
    active: true,
  },
  {
    name: "Resume",
    href: RESUME_LINK,
    linkTitle: `View ${SITE.author}'s resume`,
    active: true,
  },
  {
    name: "Twitch",
    href: "https://twitch.tv/samathingamajig",
    linkTitle: `${SITE.title} on Twitch`,
    active: true,
  },
  {
    name: "YouTube",
    href: "https://youtube.com/@samathingamajig",
    linkTitle: `${SITE.title} on YouTube`,
    active: true,
  },
];
