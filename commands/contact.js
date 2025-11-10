import {
    SlashCommandBuilder,
    EmbedBuilder,
    StringSelectMenuBuilder,
    ActionRowBuilder,
  } from "discord.js";
  
  // Salon où le message de contact doit toujours être envoyé
  const CONTACT_CHANNEL_ID = "1435687564857315426";
  
  export const data = new SlashCommandBuilder()
    .setName("contact")
    .setDescription(
      "Affiche le Centre de Contact Officiel de la Gendarmerie (Ile-de-France / 77)."
    );
  
  export async function execute(interaction) {
    // On récupère le salon cible
    const targetChannel = interaction.client.channels.cache.get(
      CONTACT_CHANNEL_ID
    );
  
    if (!targetChannel) {
      return interaction.reply({
        content:
          "❌ Impossible de trouver le salon de contact (ID: 1435687564857315426). Vérifie que le bot y a accès.",
        ephemeral: true,
      });
    }
  
    const embed = new EmbedBuilder()
      .setColor(0x2b6cb0)
      .setTitle("🏛️ Centre de Contact Officiel - Gendarmerie Nationale")
      .setDescription(
        "Bienvenue au **Centre de Contact Officiel** de la **Gendarmerie Nationale d'Île-de-France (Seine-et-Marne - 77)**.\n\n" +
          "Pour prendre contact avec un Gendarme, veuillez sélectionner la raison ci-dessous."
      )
      .setImage(
        "https://media.discordapp.net/attachments/1292376806447386707/1436692456057081920/image_1.png?width=1421&height=800"
      )
      .setFooter({
        text: "Gendarmerie Nationale • Région Île-de-France (77)",
      });
  
    const menu = new StringSelectMenuBuilder()
      .setCustomId("contact_menu")
      .setPlaceholder("📩 Sélectionnez le motif de votre demande")
      .addOptions(
        {
          label: "Prise de contact",
          description: "Formulaire général de contact",
          value: "prise_contact",
          emoji: "📞",
        },
        {
          label: "Contact Compagnie",
          description: "Contacter une compagnie ou brigade",
          value: "contact_compagnie",
          emoji: "🏢",
        },
        {
          label: "Déposer une plainte",
          description: "Transmettre une plainte en ligne",
          value: "deposer_plainte",
          emoji: "📋",
        },
        {
          label: "Contact IGGN",
          description: "Saisir l’Inspection Générale de la Gendarmerie",
          value: "contact_iggn",
          emoji: "⚖️",
        }
      );
  
    const row = new ActionRowBuilder().addComponents(menu);
  
    // Envoi du message dans le salon dédié
    await targetChannel.send({
      embeds: [embed],
      components: [row],
    });
  
    // Confirmation éphémère pour l'utilisateur qui a exécuté la commande
    await interaction.reply({
      content: `✅ Centre de contact publié dans <#${CONTACT_CHANNEL_ID}>.`,
      ephemeral: true,
    });
  }
  