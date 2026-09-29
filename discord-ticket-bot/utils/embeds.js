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
// TICKET CREATED
// =====================================================

function ticketCreatedEmbed(user, type = 'support') {
  const avatar = user.displayAvatarURL({
    extension: 'png',
    size: 256,
  });

  const data = {
    // =========================
    // SUPPORT
    // =========================

    support: {
      title: '🛠️ أهلاً بك في الدعم الفني',
      color: COLORS.primary,

      text: [
        `مرحبًا <@${user.id}>`,
        '',
        'تم إنشاء تذكرة **الدعم الفني** بنجاح.',
        '',
        '📝 **اكتب مشكلتك أو استفسارك بالتفصيل.**',
        '📸 إذا كانت المشكلة تحتاج صورة أو إثبات، أرفقه هنا.',
        '',
        '🛡️ أحد أعضاء فريق الدعم سيقوم بمساعدتك.',
      ],
    },

    // =========================
    // ADMIN APPLICATION
    // =========================

    team: {
      title: '👤 أهلاً بك في التقديم على الإدارة',
      color: COLORS.success,

      text: [
        `مرحبًا <@${user.id}>`,
        '',
        'تم إنشاء تذكرة **التقديم على الإدارة**.',
        '',
        '📋 **يرجى الإجابة على المعلومات التالية:**',
        '',
        '• اسمك:',
        '• عمرك:',
        '• خبرتك في الإدارة:',
        '• لماذا تريد الانضمام إلى إدارة ZN-MAZEN؟',
        '• ما الذي يمكنك تقديمه للسيرفر؟',
        '• أي معلومات إضافية:',
        '',
        '🏆 سيتم مراجعة طلبك من قبل المسؤولين.',
      ],
    },

    // =========================
    // EDITOR APPLICATION
    // =========================

    admin: {
      title: '📋 أهلاً بك في التقديم على ايدتور',
      color: COLORS.warning,

      text: [
        `مرحبًا <@${user.id}>`,
        '',
        'تم إنشاء تذكرة **التقديم على ايدتور**.',
        '',
        '📋 **يرجى الإجابة على المعلومات التالية:**',
        '',
        '• اسمك:',
        '• عمرك:',
        '• خبرتك في المونتاج:',
        '• ما البرامج التي تستخدمها؟',
        '• ما نوع الإيديتات التي تستطيع تقديمها؟',
        '• نماذج من أعمالك:',
        '• أي معلومات إضافية:',
        '',
        '🎬 سيتم مراجعة طلبك من قبل المسؤولين.',
      ],
    },
  };

  const selected = data[type] || data.support;

  return new EmbedBuilder()
    .setColor(selected.color)
    .setAuthor({
      name: user.username,
      iconURL: avatar,
    })
    .setTitle(selected.title)
    .setDescription(selected.text.join('\n'))
    .setThumbnail(avatar)
    .setFooter({
      text: 'ZN-MAZEN • Ticket System',
    })
    .setTimestamp();
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

function welcomeEmbed(member) {
  const avatar = member.user.displayAvatarURL({
    extension: 'png',
    size: 512,
  });

  return new EmbedBuilder()
    .setColor(COLORS.primary)
    .setAuthor({
      name: 'ZN-MAZEN',
      iconURL: avatar,
    })
    .setTitle('⚜️ أهلاً بك في ZN-MAZEN')
    .setDescription(
      [
        `🎉 نورت السيرفر <@${member.id}>!`,
        '',
        `👤 **العضو:** ${member.user.username}`,
        '',
        '⚜️ أهلاً بك في مجتمع **ZN-MAZEN**.',
        '🎮 نتمنى لك تجربة ممتعة معنا.',
        '',
        '📌 لا تنسَ قراءة القوانين والاطلاع على القنوات المهمة.',
        '',
        '🔥 **نتمنى لك وقتًا ممتعًا معنا!**',
      ].join('\n')
    )
    .setThumbnail(avatar)
    .setFooter({
      text: `ZN-MAZEN • عضو جديد #${member.guild.memberCount}`,
    })
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
  ticketClaimedEmbed,
  closeRequestEmbed,
  welcomeEmbed,
  errorEmbed,
  successEmbed,
  ticketLogEmbed,
};