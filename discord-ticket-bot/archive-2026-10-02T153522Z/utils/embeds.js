const { EmbedBuilder } = require('discord.js');

const COLORS = {
  primary: 0xC9A227,
  success: 0x57f287,
  danger: 0xed4245,
  warning: 0xfee75c,
  neutral: 0x2b2d31,
};

// =====================================================
// TICKET PANEL
// =====================================================

function ticketPanelEmbed() {
  return new EmbedBuilder()
    .setColor(COLORS.primary)
    .setTitle('⚜️ إدارة سيرفر ZN-MAZEN')
    .setDescription(
      [
        'مرحبًا بك في نظام التذاكر الخاص بإدارة سيرفر **ZN-MAZEN**.',
        '',
        'يرجى اختيار القسم المناسب من الأزرار بالأسفل:',
        '',
        '🛠️ **الدعم الفني**',
        'لطرح المشاكل والاستفسارات أو طلب المساعدة بخصوص السيرفر.',
        '',
        '👤 **التقديم على الإدارة**',
        'لمن يرغب في التقديم والانضمام إلى طاقم إدارة سيرفر **ZN-MAZEN**.',
        '',
        '📋 **التقديم على ايدتور**',
        'لمن يرغب في التقديم للعمل كايدتور ضمن سيرفر **ZN-MAZEN**.',
        '',
        '━━━━━━━━━━━━━━━━━━',
        '📌 يرجى اختيار القسم المناسب وعدم فتح أكثر من تذكرة لنفس الطلب.',
      ].join('\n')
    )
    .setFooter({
      text: 'ZN-MAZEN • Server Management',
    })
    .setTimestamp();
}

// =====================================================
// TICKET CREATED (رسالة الترحيب أول ما التذكرة تتفتح)
// =====================================================

// اسم ملف البنر (لازم يتبعت مع الرسالة كـ attachment)
const TICKET_BANNER_NAME = 'welcome-banner.png';

const DIVIDER = '━━━━━━━━━━━━━━━━━━';

const TICKET_WELCOME = {
  // ---------- الدعم الفني ----------
  support: {
    title: '🛠️ الدعم الفني',
    color: COLORS.primary,
    intro: 'تم فتح تذكرتك بنجاح، وفريق الدعم في طريقه إليك 🤝',
    body: [
      '📝 اكتب مشكلتك أو استفسارك **بالتفصيل**.',
      '📸 لو عندك صورة أو إثبات، ارفقه هنا.',
    ],
    steps: [
      '1️⃣ اشرح مشكلتك',
      '2️⃣ انتظر رد أحد أعضاء الفريق',
      '3️⃣ بعد الحل، سيتم إغلاق التذكرة',
    ],
  },

  // ---------- التقديم على مود ----------
  team: {
    title: '👤 التقديم على مود',
    color: COLORS.success,
    intro: 'أهلاً بك في تقديم فريق الموديراتور، يسعدنا اهتمامك بالانضمام لنا 💚',
    body: [
      '✅ تعرّف على نفسك بشكل مختصر.',
      '✅ احكِ لنا عن خبرتك وليه حابب تنضم للفريق.',
    ],
    steps: [
      '1️⃣ اكتب رسالتك هنا في التذكرة',
      '2️⃣ سيقوم المسؤولون بمراجعة طلبك',
      '3️⃣ سنتواصل معك هنا بالنتيجة',
    ],
  },

  // ---------- التقديم على ايدتور ----------
  admin: {
    title: '📋 التقديم على ايدتور',
    color: COLORS.warning,
    intro: 'أهلاً بك في تقديم الإيديتورز، يسعدنا اهتمامك بالانضمام لنا 🎬',
    body: [
      '✅ عرّفنا بنفسك وبخبرتك في المونتاج.',
      '🎞️ ارفق نماذج من أعمالك لو متاحة.',
    ],
    steps: [
      '1️⃣ اكتب رسالتك وأرفق أعمالك هنا',
      '2️⃣ سيقوم المسؤولون بمراجعة طلبك',
      '3️⃣ سنتواصل معك هنا بالنتيجة',
    ],
  },
};

function ticketCreatedEmbed(user, type = 'support', { withBanner = true } = {}) {
  const avatar = user.displayAvatarURL({
    extension: 'png',
    size: 256,
  });

  const t = TICKET_WELCOME[type] || TICKET_WELCOME.support;

  const embed = new EmbedBuilder()
    .setColor(t.color)
    .setAuthor({
      name: user.username,
      iconURL: avatar,
    })
    .setTitle(t.title)
    .setDescription(
      [
        `مرحبًا <@${user.id}> 👋`,
        t.intro,
        '',
        ...t.body,
        '',
        DIVIDER,
        '⚡ **الخطوات:**',
        ...t.steps,
        DIVIDER,
        '🙏 نشكرك على صبرك.',
      ].join('\n')
    )
    .setThumbnail(avatar)
    .setFooter({
      text: 'ZN-MAZEN • Ticket System',
    })
    .setTimestamp();

  // البنر في آخر الرسالة (لازم الملف يتبعت معاها — شوف interactionCreate.js)
  if (withBanner) embed.setImage(`attachment://${TICKET_BANNER_NAME}`);

  return embed;
}

// =====================================================
// APPLICATION QUESTIONS (رسالة الأسئلة الصغيرة للتقديمات)
// =====================================================

const APPLICATION_QUESTIONS = {
  team: {
    title: '🎮 أسئلة تقديم مود | Kick',
    color: COLORS.success,
    questions: [
      'الاسم',
      'العمر',
      'الخبرة في الكيك',
      '1. كيف تعمل Timeout ومتى؟',
      '2. كيف تعمل Ban ومتى؟',
      '3. كيف تغير عنوان اللايف؟',
      '4. كيف تعمل تصويت؟',
    ],
  },
  admin: {
    title: '🎬 أسئلة تقديم ايدتور | Editor',
    color: COLORS.warning,
    questions: ['الاسم', 'السن', 'رابط الحسابات سوشيال'],
  },
};

// بترجع null لو نوع التذكرة ملوش أسئلة (زي الدعم الفني)
function applicationQuestionsEmbed(type) {
  const data = APPLICATION_QUESTIONS[type];
  if (!data) return null;

  return new EmbedBuilder()
    .setColor(data.color)
    .setTitle(data.title)
    .setDescription(data.questions.map((q) => `**${q}**`).join('\n'));
}

// =====================================================
// CLAIMED
// =====================================================

function ticketClaimedEmbed(staffId) {
  return new EmbedBuilder()
    .setColor(COLORS.success)
    .setTitle('🎯 تم استلام التذكرة')
    .setDescription(
      `تم استلام هذه التذكرة بواسطة <@${staffId}>.\n\nسيتم متابعة طلبك الآن.`
    )
    .setTimestamp();
}

// =====================================================
// CLOSE REQUEST
// =====================================================

function closeRequestEmbed(userId) {
  return new EmbedBuilder()
    .setColor(COLORS.danger)
    .setTitle('🔒 إغلاق التذكرة')
    .setDescription(
      `هل أنت متأكد من رغبتك في إغلاق التذكرة <@${userId}>؟`
    );
}

// =====================================================
// WELCOME
// =====================================================

const WELCOME_COLOR = 0x4b50e0;

const escapeMd = (text) => String(text).replace(/([*_`~|\\])/g, '\\$1');

function welcomeEmbed(member, { withBanner = false } = {}) {
  const avatar = member.user.displayAvatarURL({ extension: 'png', size: 512 });
  const name = escapeMd(member.displayName || member.user.username);

  const accountCreated = member.user.createdAt.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });

  const embed = new EmbedBuilder()
    .setColor(WELCOME_COLOR)
    .setDescription(
      [
        `🌟 أهلاً بك يا ***${name}*** في سيرفر **مازن**!`,
        '✨ يسعدنا انضمامك لينا،',
        'اتمنى تقضي وقت حلو مع الأعضاء.',
      ].join('\n')
    )
    .setThumbnail(avatar)
    .addFields(
      { name: '👥 العضو رقم', value: `#${member.guild.memberCount}` },
      { name: '📅 عضو منذ', value: accountCreated },
      { name: '\u200b', value: '\u200b' },
      {
        name: '📌 قبل ما تبدأ',
        value: [
          '📜 اقرأ **قوانين السيرفر** عشان تعرف كل حاجة',
          '💬 اشارك في **الدردشة العامة** وتعرف على الأعضاء',
          '🛠️ لو احتجت مساعدة، افتح **(Ticket)** تذكرة',
        ].join('\n'),
      }
    )
    .setFooter({ text: '💖 نورت سيرفر مازن | طاقم الإدارة يرحب بك دائماً' })
    .setTimestamp();

  if (withBanner) embed.setImage('attachment://welcome-banner.png');
  return embed;
}

// =====================================================
// SECURITY (روم الحماية)
// =====================================================

function securityEmbed() {
  return new EmbedBuilder()
    .setColor(0xed4245)
    .setTitle('🛡️ روم حماية من الحسابات المخترقة')
    .setDescription(
      [
        'هذه الروم مخصصة **لحماية السيرفر من الحسابات المخترقة** فقط، وهي جزء من نظام الأمان التلقائي.',
        '',
        '**⚠️ ممنوع الكتابة هنا نهائياً.**',
        'أي رسالة تُرسل هنا تُعتبر مؤشر اختراق أو نشاط مشبوه، وسيتم التعامل معها تلقائياً بالخطوات التالية:',
        '',
        '**🔇 كتم فوري**',
        'يتم كتم صاحب الرسالة تلقائياً لمدة **60 دقيقة**.',
        '**🗑️ حذف تلقائي**',
        'يتم حذف **آخر رسالة** أرسلها العضو من كل رومات السيرفر.',
        '**❗ لو حسابك اتهكر**',
        'غيّر كلمة السر فوراً وفعّل التحقق بخطوتين، وتواصل مع الإدارة عن طريق فتح تذكرة (Ticket) لمراجعة حسابك.',
      ].join('\n')
    )
    .setFooter({ text: 'مازن Security System' })
    .setTimestamp();
}

// =====================================================
// ERROR
// =====================================================

function errorEmbed(message) {
  return new EmbedBuilder()
    .setColor(COLORS.danger)
    .setTitle('❌ حدث خطأ')
    .setDescription(message);
}

// =====================================================
// SUCCESS
// =====================================================

function successEmbed(message) {
  return new EmbedBuilder()
    .setColor(COLORS.success)
    .setTitle('✅ تم بنجاح')
    .setDescription(message);
}

// =====================================================
// TICKET LOG
// =====================================================

function ticketLogEmbed(ticket, extra = {}) {
  return new EmbedBuilder()
    .setColor(COLORS.neutral)
    .setTitle('📋 Ticket Log')
    .addFields(
      {
        name: '👤 صاحب التذكرة',
        value: ticket.creatorId
          ? `<@${ticket.creatorId}>`
          : 'غير معروف',
        inline: true,
      },
      {
        name: '🎫 النوع',
        value: ticket.typeName || 'غير معروف',
        inline: true,
      },
      {
        name: '🛡️ المستلم',
        value: ticket.claimerId
          ? `<@${ticket.claimerId}>`
          : 'لم يتم الاستلام',
        inline: true,
      },
      {
        name: '🔒 أغلق بواسطة',
        value: ticket.closedById
          ? `<@${ticket.closedById}>`
          : 'غير معروف',
        inline: true,
      }
    )
    .setTimestamp();
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  COLORS,
  ticketPanelEmbed,
  ticketCreatedEmbed,
  applicationQuestionsEmbed,
  TICKET_BANNER_NAME,
  ticketClaimedEmbed,
  closeRequestEmbed,
  welcomeEmbed,
  securityEmbed,
  errorEmbed,
  successEmbed,
  ticketLogEmbed,
};