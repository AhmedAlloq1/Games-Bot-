const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder,
} = require('discord.js');

const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-panel')
    .setDescription('إرسال بانل التذاكر'),

  async execute(interaction) {
    const imagePath = path.join(
      __dirname,
      '..',
      'assets',
      'welcome-banner.png'
    );

    const attachment = new AttachmentBuilder(
      imagePath,
      {
        name: 'welcome-banner.png',
      }
    );

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)

      .setTitle('⚜️ إدارة سيرفر ZN-MAZEN')

      .setDescription(
        'مرحبًا بك في نظام التذاكر الخاص بإدارة سيرفر **ZN-MAZEN**.\n\n' +

        'يرجى اختيار القسم المناسب من الأزرار بالأسفل، وسيتم التعامل مع طلبك من قِبل الإدارة المختصة.\n\n' +

        '🛠️ **دعم فني**\n' +
        'للشكاوى أو المشاكل التي تتعلق بالرقابة والسلوك داخل السيرفر، ' +
        'يرجى ذكر المشكلة وإرفاق الأدلة إن وجدت.\n\n' +

        '👤 **تقديم مود**\n' +
        'لمن يرغب في التقديم للانضمام إلى فريق الموديراتور في سيرفر **ZN-MAZEN**، ' +
        'يرجى تعبئة البيانات المطلوبة والإجابة على جميع الأسئلة بشكل صحيح.\n\n' +

        '📋 **تقديم ايدتور**\n' +
        'لمن يرغب في التقديم للعمل كايدتور ضمن سيرفر **ZN-MAZEN**، ' +
        'يرجى تقديم أعمالك السابقة وذكر خبرتك في مجال المونتاج والتحرير.\n\n' +

        '━━━━━━━━━━━━━━━━━━\n\n' +

        '📌 **يرجى اختيار القسم المناسب لطلبك وعدم فتح أكثر من تذكرة لنفس الموضوع.**\n\n' +

        '⚜️ **ZN-MAZEN • Server Management**'
      )

      .setImage('attachment://welcome-banner.png');

    const row = new ActionRowBuilder().addComponents(

      new ButtonBuilder()
        .setCustomId('ticket_support')
        .setLabel('دعم فني')
        .setEmoji('🔧')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId('ticket_team')
        .setLabel('تقديم مود')
        .setEmoji('👤')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId('ticket_admin')
        .setLabel('تقديم ايدتور')
        .setEmoji('📋')
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.channel.send({
      embeds: [embed],
      components: [row],
      files: [attachment],
    });

    await interaction.reply({
      content: '✅ تم إرسال بانل التذاكر بنجاح.',
      ephemeral: true,
    });
  },
};