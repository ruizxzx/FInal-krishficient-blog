const fs = require('fs');
const content = fs.readFileSync('src/components/ContactView.tsx', 'utf8');
const start = content.indexOf('  // Social / Communication Channels Placeholders');
const end = content.indexOf('  ];', start) + 4;
const replacement = `  // Social / Communication Channels Placeholders
  const channels = [
    {
      id: 'email',
      name: 'Email (Direct)',
      handle: siteConfig.contactEmail || 'hello@krishficient.dev',
      description: 'Primary inbox for serious architectural inquiries and essays.',
      actionText: 'Copy Email',
      copyValue: siteConfig.contactEmail || 'hello@krishficient.dev',
      color: 'bg-[var(--color-primary)]',
      icon: Mail,
    },
    {
      id: 'telegram',
      name: 'Telegram',
      handle: siteConfig.contactTelegram || '@krishficient',
      description: 'Encrypted direct messaging for asynchronous developer sync.',
      actionText: 'Copy Handle',
      copyValue: siteConfig.contactTelegram || '@krishficient',
      color: 'bg-[var(--color-secondary)]',
      icon: Send,
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      handle: siteConfig.contactTwitter || '@krishficient',
      description: 'Public thoughts, micro-essays, and shitposting about tech.',
      actionText: 'Copy Handle',
      copyValue: siteConfig.contactTwitter || '@krishficient',
      color: 'bg-[var(--color-accent)]',
      icon: MessageSquare,
    },
    {
      id: 'github',
      name: 'GitHub',
      handle: siteConfig.contactGithub || 'github.com/krishficient',
      description: 'Open source system architectures and tooling.',
      actionText: 'Copy Link',
      copyValue: siteConfig.contactGithub || 'https://github.com/krishficient',
      color: 'bg-[var(--color-success)]',
      icon: Terminal,
    }
  ];`;
fs.writeFileSync('src/components/ContactView.tsx', content.substring(0, start) + replacement + content.substring(end));
