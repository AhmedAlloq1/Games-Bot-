=const {
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
      // صورة لوحة التذاكر
      const imagePath = path.join(
        __dirname,
        '..',
        'assets',
        'ticket.png'
      );

      const attachment = new AttachmentBuilder(imagePath, {
        name: 'ticket.png',
      });

      const embed = new EmbedBuilder()
        .setColor(0xC9A227)
        .setTitle('⚜️ إدارة سيرفر ZN-MAZEN')
        .setDescription(
          'مرحبًا بك في نظام التذاكر الخاص بإدارة سيرفر **ZN-MAZEN**.\n\n' +

          'اختر القسم المناسب من الأزرار بالأسفل، وسيتم تحويل طلبك إلى القسم المختص.\n\n' +

          '🛠️ **الدعم الفني**\n' +
          'للمشاكل والاستفسارات وطلب المساعدة بخصوص السيرفر.\n\n' +

          '👤 **التقديم على مود**\n' +
          'للتقديم والانضمام إلى فريق الموديراتور في سيرفر **ZN-MAZEN**.\n\n' +

          '📋 **التقديم على ايدتور**\n' +
          'للتقديم للعمل كايدتور ضمن سيرفر **ZN-MAZEN**.\n\n' +

          '━━━━━━━━━━━━━━━━━━\n\n' +

          '📌 **يرجى اختيار القسم المناسب وعدم فتح أكثر من تذكرة لنفس الموضوع.**'
        )
        .setImage('attachment://ticket.png')
        .setFooter({
          text: 'ZN-MAZEN • Server Management',
        })
        .setTimestamp();

      // أزرار التذاكر - ستايل مودرن
      const row = new ActionRowBuilder().addComponents(

        new ButtonBuilder()
          .setCustomId('ticket_support')
          .setLabel('الدعم الفني')
          .setEmoji('🛠️')
          .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
          .setCustomId('ticket_team')
          .setLabel('التقديم على مود')
          .setEmoji('👤')
          .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
          .setCustomId('ticket_admin')
          .setLabel('التقديم على ايدتور')
          .setEmoji('📋')
          .setStyle(ButtonStyle.Secondary)
      );

      await interaction.channel.send({
        embeds: [embed],
        components: [row],
        files: [attachment],
      });

      await interaction.reply({
        content: '✅ تم إرسال لوحة التذاكر بنجاح.',
        ephemeral: true,
      });

    } catch (error) {
      console.error(
        '[COMMAND ticket-panel] Failed to send panel:',
        error
      );

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content:
            '❌ لم أتمكن من إرسال لوحة التذاكر. تأكد من صلاحيات البوت في هذه القناة.',
          ephemeral: true,
        });
      }
    }
  },
};