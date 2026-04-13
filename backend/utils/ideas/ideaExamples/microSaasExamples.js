// Micro-SaaS ideas you could build and sell

const microSaasExamples = [
  {
    idea: {
      title: 'Waitlist Landing Page Builder',
      description: 'Drag-and-drop interface to build beautiful waitlists for indie hackers. Charge $5-20/month. 50 customers = $2-5K MRR. Build it in 2 weeks, passive income. Indie hackers love this.',
      technologies: ['React', 'Node.js', 'Stripe', 'Email Service'],
      difficulty: 'Easy',
      timeEstimate: '30 hours',
      pricing: '$5-20/month',
      targetCustomers: 'Indie hackers, startups, product launches'
    },
    match: (skills, domains, keywords) => skills.includes('react') || keywords.includes('saas')
  },
  {
    idea: {
      title: 'Code Snippet Manager with AI Search',
      description: 'Smart repository for code snippets with LLM-powered search. Developers save time = willing to pay. $10/month, 30 customers = $3K MRR. Ship it.',
      technologies: ['React', 'Node.js', 'PostgreSQL', 'LLM API'],
      difficulty: 'Easy',
      timeEstimate: '25 hours',
      pricing: '$10/month',
      targetCustomers: 'Software developers, teams'
    },
    match: (skills, domains, keywords) => skills.includes('ai') && skills.includes('react')
  },
  {
    idea: {
      title: 'SEO Audit Tool (Lightweight)',
      description: 'Crawl websites, audit SEO issues, generate reports. Agencies will pay $50/month for this. Build once, charge monthly. Profitable from day one.',
      technologies: ['Node.js', 'Puppeteer', 'React', 'Stripe'],
      difficulty: 'Medium',
      timeEstimate: '40 hours',
      pricing: '$30-50/month',
      targetCustomers: 'Marketing agencies, freelancers'
    },
    match: (skills, domains, keywords) => keywords.includes('web') || keywords.includes('seo')
  }
];

module.exports = microSaasExamples;
