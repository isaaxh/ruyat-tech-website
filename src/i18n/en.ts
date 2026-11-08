// English copy. Text is taken verbatim from design/Main.dc.html.
// Strings marked NEW are not in the design (WhatsApp flow, meta tags); see README "Differences from the design".
export const en = {
  lang: 'en',
  dir: 'ltr',
  meta: {
    // NEW: the design has no meta tags; built from existing hero copy.
    title: 'Ruyat Tech | We build software that builds your business',
    description:
      'Mobile apps, web apps, websites and automation for new businesses. From the first idea to launch day.',
    ogLocale: 'en_US',
  },
  skipLink: 'Skip to content',
  brand: { logoLabel: 'Ruyat Tech, back to top', markLabel: 'Ruyat Tech mark' },
  nav: {
    mainLabel: 'Main',
    mobileLabel: 'Mobile',
    dotLabel: 'Show navigation',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    cta: 'Start a project',
    links: [
      { href: '#services', label: 'Services' },
      { href: '#process', label: 'Process' },
      { href: '#work', label: 'Work' },
      { href: '#testimonials', label: 'Testimonials' },
      { href: '#contact', label: 'Contact' },
    ],
    // Link to the other language
    lang: { label: 'العربية', lang: 'ar', href: '/ar/' },
  },
  hero: {
    titleLine1: 'We build software',
    titleLine2: 'that builds your business',
    sub: 'Mobile apps, web apps, websites and automation for new businesses. From the first idea to launch day.',
    primary: 'Start a project',
    secondary: 'See our work',
  },
  partners: {
    title: 'Our partners',
    sub: 'Strategic partnership for innovative future',
    logos: {
      ruyatAlEnjaz: 'Ruyat Al Enjaz',
      maher: 'Maher International',
      homeline: 'Homeline',
      alfaisal: 'Al Faisal Group and Partners',
      ruyatShams: 'Ruyat Shams',
      safeen: 'Safeen',
    },
  },
  services: {
    title: 'What we build',
    lede: "Four things, done well. Tell us the goal and we'll help you pick the right one.",
    items: {
      mobile: {
        title: 'Mobile apps',
        promise: 'Your app, live on the App Store and Google Play.',
        desc: 'We design and build apps for iPhone and Android that your customers will actually enjoy using. You get a finished app, published under your own account, and a plan for what comes next.',
        link: 'Talk to us about mobile apps',
      },
      webapp: {
        title: 'Web apps',
        promise: 'Software your team and customers can use from any browser.',
        desc: 'Dashboards, booking systems, customer portals and internal tools. You get a working product with clear screens, secure sign-in and room to add features later.',
        link: 'Talk to us about web apps',
      },
      website: {
        title: 'Websites',
        promise: 'A clear, fast website that explains your business in seconds.',
        desc: 'We write the structure, design the pages and build the site with you. You get a website you can update yourself, and that looks right on every screen.',
        link: 'Talk to us about websites',
      },
      automation: {
        title: 'Automation',
        promise: 'Less repeat work, fewer mistakes.',
        desc: 'We take the manual jobs that eat your week, like sending invoices, moving data between tools or answering the same questions, and set them up to run on their own. You get your time back.',
        link: 'Talk to us about automation',
      },
    },
  },
  process: {
    title: 'How we work',
    lede: "Six stages, no surprises. You know what's happening at every one.",
    close: {
      text: "Not sure where you are? We'll help you find the right first step.",
      cta: 'Start a project',
    },
    steps: [
      {
        title: 'Discovery & planning',
        desc: 'We learn about your business and goals, then agree on the features, timeline and scope before any work begins.',
      },
      {
        title: 'Design & prototyping',
        desc: 'We design the key screens and turn them into a clickable prototype you can try and approve.',
      },
      {
        title: 'Development & testing',
        desc: 'We build your product in small steps and test it on real devices along the way.',
      },
      {
        title: 'Iteration & feedback',
        desc: 'We share progress with you regularly, take your feedback and make changes early.',
      },
      {
        title: 'Deployment & launch',
        desc: 'We publish your product under your own accounts and check that everything works live.',
      },
      {
        title: 'Maintenance & support',
        desc: 'After launch, we keep your product secure and up to date, fix issues and add improvements.',
      },
    ],
  },
  work: {
    title: "Work we're proud of",
    lede: 'A few projects, and what they did for the people who asked for them.',
    quickbite: {
      tag: 'Mobile app',
      client: 'QuickBite',
      desc: 'A food ordering app, from browsing and customizing meals to checkout and live order tracking.',
      shots: [
        'QuickBite home screen with food categories',
        'QuickBite burger detail screen',
        'QuickBite live order tracking screen',
      ],
    },
    moneylion: {
      tag: 'Web app',
      client: 'MoneyLion',
      desc: 'A customized fintech dashboard solution with an advanced auth system.',
      shotLabel: 'Visit MoneyLion (opens in a new tab)',
      shotAlt: 'MoneyLion website shown on a MacBook',
    },
    perdana: {
      tag: 'Website',
      client: 'Perdana Fellows Alumni Association',
      desc: 'The official alumni portal for the Perdana Fellows Alumni Association.',
      shotLabel: 'Visit Perdana Fellows Alumni Association (opens in a new tab)',
      shotAlt: 'Perdana Fellows Alumni Association website shown on a MacBook',
    },
    visit: 'Visit the site',
    cta: 'Start a project like these',
  },
  why: {
    title: 'Your technical partner, to launch and beyond',
    lede: 'Choosing who builds your product is a big decision. Here is what you can expect from us.',
    reasons: [
      {
        icon: 'chat',
        title: 'We explain things simply.',
        desc: "No jargon. You'll always know what we're doing, why, and what happens next.",
      },
      {
        icon: 'hexagon',
        title: 'Free maintenance.',
        desc: "After launch, we fix bugs and keep your product running at no extra cost for 60 days. If something looks wrong, tell us and we'll sort it out. You don't have to chase anyone.",
      },
      {
        icon: 'steps',
        title: 'We work in small steps.',
        desc: 'You see progress often, so you can change direction early and not at the end.',
      },
      {
        icon: 'rocket',
        title: 'Built for new businesses.',
        desc: "We know you're moving fast with limited time. We build what you need now and leave room to grow.",
      },
      {
        icon: 'code',
        title: "It's yours.",
        desc: 'The source code, the accounts and the product belong to you from day one.',
      },
      {
        icon: 'shield',
        title: 'Your data stays protected.',
        desc: "We build security in from the start and collect only the data your product needs. Your customers' information stays private, and access stays in your hands.",
      },
    ],
    backed: {
      title: 'Backed by Ruyat Al Enjaz',
      desc: "Ruyat Tech is the software arm of Ruyat Al Enjaz, an established company with deep roots in Makkah. That means we're stable, local and here for the long run, so your product has a team behind it long after launch.",
      badge: 'Powered by Ruyat Al Enjaz',
    },
  },
  testimonials: {
    title: "Don't just take our word for it.",
    quotes: { open: '“', close: '”' },
    regionLabel: 'Client testimonials',
    prev: 'Previous testimonial',
    next: 'Next testimonial',
    slideLabel: (n: number, total: number) => `${n} of ${total}`,
    dotLabel: (n: number) => `Show testimonial ${n}`,
    items: [
      {
        lead: 'We used Ruyat Tech services for our complicated animated website. ',
        soft: 'They were incredibly thorough, organized and patient with us. Their level of service and technical knowledge was incredible. A pleasure to work with!',
        initials: 'GH',
        name: 'Goran Hankic',
        role: 'Founder & CEO',
      },
      {
        lead: 'I had the pleasure of working with Ruyat Tech on several web development projects and I can confidently say that they are top-notch professionals. ',
        soft: 'They consistently deliver outstanding results that are 100% accurate and delivered on time.',
        initials: 'GT',
        name: 'Gabrial Tania',
        role: 'Business Owner',
      },
      {
        lead: 'Our team contracted Ruyat Tech for several applications and UI/UX development. ',
        soft: 'Not only did they deliver on time, they made sure everything was pixel perfect. Their attention to detail and time management is sublime. Highly recommended.',
        initials: 'MS',
        name: 'Muhsin Suhor',
        role: 'Entrepreneur',
      },
    ],
  },
  contact: {
    hud: 'Now booking projects',
    title: "Let's talk about your project",
    lede: "Tell us what you want to build. We'll read it and reply with a clear next step.",
    reachLabel: 'Other ways to reach us',
    details: {
      email: 'Email',
      phone: 'Phone',
      whatsapp: 'WhatsApp',
      location: 'Location',
      hours: 'Hours',
      address: 'Ash Shawqiyah, Makkah, Saudi Arabia',
      hoursValue: 'Saturday to Thursday, 8:30 AM to 6:30 PM',
    },
    form: {
      label: 'Project enquiry',
      name: { label: 'Your name', placeholder: 'e.g. Sara Alharbi', error: 'Please enter your name.' },
      email: {
        label: 'Email address',
        placeholder: 'you@company.com',
        error: "That email doesn't look right. Check it and try again.",
      },
      phone: { label: 'Phone or WhatsApp', placeholder: 'e.g. +966 5X XXX XXXX' },
      business: { label: 'Business name', placeholder: 'Your business or idea' },
      optional: 'Optional',
      service: {
        label: 'What do you need?',
        placeholder: 'Choose one',
        error: 'Choose the option that fits best.',
        options: ['Mobile app', 'Web app', 'Website', 'Automation', 'Not sure yet'],
      },
      details: {
        label: 'Tell us about your project',
        placeholder: 'What do you want to build, and who is it for?',
        error: 'Add a few lines so we know where to start.',
      },
      submit: 'Send on WhatsApp',
    },
    // NEW: success panel copy changed for the WhatsApp flow (needs client approval).
    success: {
      title: (firstName: string) => `Thanks, ${firstName}. Your message is ready.`,
      body: 'WhatsApp should have opened with your message ready. Tap send to finish.',
      again: 'Open WhatsApp again',
    },
    // NEW: WhatsApp message labels (plain text, one field per line).
    whatsapp: {
      greeting: 'New project enquiry from tech.ruyat.sa',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      business: 'Business',
      service: 'Service',
      details: 'Project details',
    },
  },
  footer: {
    tagline: 'Vision, engineered.',
    blurb: 'We build mobile apps, web apps, websites and automation for new businesses.',
    badge: 'Powered by Ruyat Al Enjaz',
    navLabel: 'Footer',
    emailLabel: 'Email info@ruyat.sa',
    phoneLabel: 'Phone +966 58 357 9979',
    locationLabel: 'Location',
    whatsappLabel: 'WhatsApp +966 53 488 0040',
    social: ['Instagram', 'TikTok', 'Snapchat'],
    copyright: '© 2026 Ruyat Tech. All rights reserved.',
    privacy: 'Privacy policy',
    terms: 'Terms',
    toTop: 'Back to top',
  },
  cookie: {
    label: 'Cookies',
    text: "We use a few cookies to make the site work and to understand how it's used.",
    accept: 'Accept',
    decline: 'Decline',
  },
};
