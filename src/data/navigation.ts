export type NavigationItem = {
  label: string;
  href: string;
  external?: boolean;
  children?: NavigationItem[];
};

export const mainNavigation: NavigationItem[] = [
  { label: 'New Here?', href: '/new-here/' },
  {
    label: 'Who We Are',
    href: '/our-story/',
    children: [
      { label: 'Our Story', href: '/our-story/' },
      { label: 'Our Vision & Values', href: '/our-vision/' },
      { label: 'Our Leadership', href: '/leadership/' },
      { label: 'Staff', href: '/staff/' },
    ],
  },
  {
    label: 'Service',
    href: '/service-times-locations/',
    children: [
      { label: 'Service Time & Location', href: '/service-times-locations/' },
      { label: 'Message Series', href: '/series/' },
    ],
  },
  {
    label: 'Join In!',
    href: '/meetups/',
    children: [
      { label: 'MeetUps', href: '/meetups/' },
      { label: 'Kids & Youth', href: '/kids-youth/' },
      { label: 'Community Meals', href: '/community-meal/' },
      { label: 'Get Involved', href: '/get-involved/' },
    ],
  },
  {
    label: 'Giving',
    href: '/giving/',
  },
  {
    label: 'Connect With Us',
    href: '/contact-us/',
    children: [
      { label: 'Sign Up for Our Newsletter', href: '/sign-up-for-our-newsletter/' },
      { label: 'Contact Us', href: '/contact-us/' },
    ],
  },
  { label: 'Get Involved', href: '/get-involved/' },
];

export const footerNavigation: NavigationItem[] = [
  { label: 'Church Center', href: 'https://thetabletx.churchcenter.com', external: true },
  { label: 'Planning Center', href: 'https://planningcenter.com', external: true },
];
