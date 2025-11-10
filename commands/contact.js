import {
    SlashCommandBuilder,
    EmbedBuilder,
    StringSelectMenuBuilder,
    ActionRowBuilder,
  } from "discord.js";
  
  export const data = new SlashCommandBuilder()
    .setName("contact")
    .setDescription("Centre de Contact Officiel - Gendarmerie Nationale (77)");
  
  export async function execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x2b6cb0)
      .setTitle("🏛️ Centre de Contact Officiel - Gendarmerie Nationale")
      .setDescription(
        "Bienvenue au **Centre de Contact Officiel** de la **Gendarmerie Nationale d'Île-de-France (Seine-et-Marne - 77)**.\n\n" +
        "Pour prendre contact avec un Gendarme, veuillez sélectionner la raison ci-dessous."
      )
      .setImage("https://media.discordapp.net/attachments/1292376806447386707/1436692456057081920/image_1.png?width=1421&height=800")
      .setFooter({ text: "Gendarmerie Nationale • Région Île-de-France" });
  
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
  
    await interaction.reply({
      embeds: [embed],
      components: [row],
    });
  }
  