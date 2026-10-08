const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  AttachmentBuilder,
} = require('discord.js');

const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-panel')
    .setDescription('إرسال لوحة التذاكر الخاصة بإدارة سيرفر ZN-MAZEN')
    .setDefaultMemberPermissions(
      PermissionFlagsBits.Administrator
    ),

  async execute(interaction) {
    try {
      // صورة البانر
      const imagePath = path.join(
        __dirname,
        '..',
        'assets',
        'welcome-banner.png'
      );

      const attachment = new AttachmentBuilder(imagePath, {
        name: 'welcome-banner.png',
      });

      // تصميم الـ Embed
      const embed = new EmbedBuilder()
        .setColor(0xC9A227)
        .setTitle('⚜️ إدارة سيرفر ZN-MAZEN')
        .setDescription(
          'مرحبًا بك في نظام التذاكر الخاص بإدارة سيرفر **ZN-MAZEN**.\n\n' +

          'يرجى اختيار القسم المناسب من الأزرار بالأسفل، وسيتم التعامل مع طلبك من قِبل الإدارة المختصة.\n\n' +

          '🛠️ **الدعم الفني**\n' +
          'لطرح المشاكل والاستفسارات أو طلب المساعدة بخصوص السيرفر.\n\n' +

          '👤 **التقديم على مود**\n' +
          'لمن يرغب في التقديم للانضمام إلى فريق الموديراتور في سيرفر **ZN-MAZEN**.\n\n' +

          '📋 **التقديم على ايدتور**\n' +
          'لمن يرغب في التقديم للعمل كايدتور ضمن سيرفر **ZN-MAZEN**.\n\n' +

          '━━━━━━━━━━━━━━━━━━\n\n' +

          '📌 **يرجى اختيار القسم المناسب لطلبك وعدم فتح أكثر من تذكرة لنفس الموضوع.**'
        )
        .setImage('attachment://welcome-banner.png')
        .setFooter({
          text: 'ZN-MAZEN • Server Management',
        })
        .setTimestamp();

      // أزرار التذاكر
      const row = new ActionRowBuilder().addComponents(

        // الدعم الفني
        new ButtonBuilder()
          .setCustomId('ticket_support')
          .setLabel('الدعم الفني')
          .setEmoji('🛠️')
          .setStyle(ButtonStyle.Secondary),

        // التقديم على مود
        new ButtonBuilder()
          .setCustomId('ticket_team')
          .setLabel('التقديم على مود')
          .setEmoji('👤')
          .setStyle(ButtonStyle.Primary),

        // التقديم على ايدتور
        new ButtonBuilder()
          .setCustomId('ticket_admin')
          .setLabel('التقديم على ايدتور')
          .setEmoji('📋')
          .setStyle(ButtonStyle.Secondary)
      );

      // إرسال لوحة التذاكر
      await interaction.channel.send({
        embeds: [embed],
        components: [row],
        files: [attachment],
      });

      // تأكيد نجاح الأمر
      await interaction.reply({
        content: '✅ تم إرسال لوحة التذاكر بنجاح.',
        ephemeral: true,
      });

    } catch (error) {
      console.error(
        '[COMMAND ticket-panel] Failed to send panel:',
        error
      );

      // التعامل مع الخطأ بدون Unknown interaction
      if (
        !interaction.replied &&
        !interaction.deferred
      ) {
        await interaction.reply({
          content:
            '❌ لم أتمكن من إرسال لوحة التذاكر. تأكد من صلاحيات البوت في هذه القناة.',
          ephemeral: true,
        });
      }
    }
  },
};