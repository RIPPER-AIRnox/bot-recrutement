import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} from "discord.js";

// ID du salon #nous-rejoindre
const NOUS_REJOINDRE_CHANNEL_ID = "1436398337405358080";

export const data = new SlashCommandBuilder()
  .setName("recrutement")
  .setDescription(
    "Publie le menu de recrutement de la Gendarmerie dans le salon #nous-rejoindre"
  );

export async function execute(interaction) {
  console.log("▶️ /recrutement exécutée");

  // On récupère le salon cible
  const targetChannel = interaction.client.channels.cache.get(
    NOUS_REJOINDRE_CHANNEL_ID
  );

  if (!targetChannel) {
    // Si le salon n'existe pas / pas accessible
    return interaction.reply({
      content:
        "❌ Impossible de trouver le salon `#nous-rejoindre` (ID: 1436398337405358080). Vérifiez que le bot y a accès.",
      ephemeral: true,
    });
  }

  const embed = new EmbedBuilder()
    .setColor(0x2b6cb0)
    .setTitle("🇫🇷 Recrutement Gendarmerie Nationale")
    .setDescription(
      "**🟩 Parcours Sous-Officier de Gendarmerie (ESOG) :**\n" +
        "• Avoir au minimum 16 ans révolus (IRL).\n" +
        "• Faire preuve de maturité, de sérieux et de rigueur.\n" +
        "• Être disponible et flexible dans vos horaires.\n\n" +
      "**🟥 Parcours Gendarme Adjoint Volontaire (EGAV) :**\n" +
        "• Avoir au minimum 15 ans révolus (IRL).\n" +
        "• Faire preuve de maturité, de sérieux et de rigueur.\n" +
        "• Être disponible et flexible dans vos horaires.\n\n" +
      "*Si vous pensez remplir toutes les conditions, sélectionnez le parcours souhaité dans le menu ci-dessous.*"
    )
    .setImage(
      "https://media.discordapp.net/attachments/1292376806447386707/1436692456057081920/image_1.png?ex=6910879d&is=690f361d&hm=aef02704c358e8c42b4fe30e07988d3521f7b0220071c6a2e7a26e24ca8f8689&=&format=webp&quality=lossless&width=1421&height=800"
    );

  const select = new StringSelectMenuBuilder()
    .setCustomId("recrutement_menu")
    .setPlaceholder("Choisissez le type de recrutement 👇")
    .addOptions(
      {
        label: "Sous-Officier de Gendarmerie (ESOG)",
        value: "sog",
        description: "Candidature ESOG",
      },
      {
        label: "Gendarme Adjoint Volontaire (EGAV)",
        value: "gav",
        description: "Candidature EGAV",
      }
    );

  const row = new ActionRowBuilder().addComponents(select);

  // Envoi dans le salon #nous-rejoindre
  await targetChannel.send({
    embeds: [embed],
    components: [row],
  });

  // Réponse de confirmation à l'utilisateur (éphémère)
  await interaction.reply({
    content:
      `✅ Le menu de recrutement a été publié dans <#${NOUS_REJOINDRE_CHANNEL_ID}>.`,
    ephemeral: true,
  });
}
