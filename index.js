import {
  Client,
  GatewayIntentBits,
  Collection,
  Events,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionsBitField,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

// === CONFIG PERSONNALISÉE ===
const WELCOME_CHANNEL_ID = "1435687564857315425";
const CATEGORY_SOG_ID = "1435687564441948180"; // DOSSIERS - ESOG
const CATEGORY_GAV_ID = "1435687564617973893"; // DOSSIERS - EGAV
const SOG_FORM_URL = "https://forms.gle/4nJLabtcr8V8ETJf9";
const DEFAULT_IMAGE =
  "https://cdn.discordapp.com/attachments/1436398337405358080/1436655957928312862/Capture_decran_2025-11-08_131208.png?ex=691065a0&is=690f1420&hm=6b98c9c01a3a2e5cf03ff214074caab7bb7a481cbe3a7a9ad5b30b5ce017e0f0&";

// Catégorie pour les salons de contact
const CONTACT_CATEGORY_ID = "1435687564617973895";
// Rôle qui doit voir tous les salons de contact (⚠️ à remplacer par le bon ID)
const GENDARMES_ROLE_ID = "ID_DU_ROLE_GENDARME";

// === CLIENT ===
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
  ],
});

// === READY ===
client.once(Events.ClientReady, () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);
  client.user.setActivity(
    "Recrutement Gendarmerie, pour la Patrie l'Honneur et le Droit 👮‍♂️"
  );
});

// === MESSAGE DE BIENVENUE ===
client.on("guildMemberAdd", async (member) => {
  try {
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (!channel) return console.log("❌ Salon de bienvenue introuvable.");

    await channel.send({
      embeds: [
        {
          title: "👋 Bienvenue à toi !",
          description: `Ravi de t’accueillir, ${member.user} !  
Merci d’avoir rejoint le serveur de la **Gendarmerie** 🇫🇷.`,
          color: 0x2b6cb0,
          thumbnail: {
            url: member.user.displayAvatarURL({ dynamic: true }),
          },
          footer: { text: "Serveur officiel - Gendarmerie Nationale" },
        },
      ],
    });
  } catch (err) {
    console.error("Erreur lors du message de bienvenue :", err);
  }
});

// === CHARGEMENT DES COMMANDES SLASH ===
client.commands = new Collection();
const commandsPath = path.join(process.cwd(), "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((f) => f.endsWith(".js"));

for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

// ===================== FONCTIONS UTILITAIRES ===================== //

// ---------- SOG : création du salon + bouton ----------
async function createSogDossier(interaction) {
  const guild = interaction.guild;

  const existing = guild.channels.cache.find(
    (ch) =>
      ch.parentId === CATEGORY_SOG_ID &&
      ch.type === ChannelType.GuildText &&
      ch.topic === `dossier-ESOG-${interaction.user.id}`
  );
  if (existing) {
    return interaction.reply({
      content: `📁 Vous avez déjà un dossier ESOG : ${existing}`,
      ephemeral: true,
    });
  }

  const safeName = `dossier-esog-${interaction.user.username}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");

  const channel = await guild.channels.create({
    name: safeName,
    type: ChannelType.GuildText,
    parent: CATEGORY_SOG_ID,
    topic: `dossier-ESOG-${interaction.user.id}`,
    permissionOverwrites: [
      {
        id: guild.roles.everyone,
        deny: [PermissionsBitField.Flags.ViewChannel],
      },
      {
        id: interaction.user.id,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ReadMessageHistory,
        ],
      },
      // ➕ ajouter ici le rôle recruteur si besoin
    ],
  });

  const button = new ButtonBuilder()
    .setCustomId("sog_finaliser")
    .setLabel("Finaliser mon dossier")
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder().addComponents(button);

  const embed = {
    color: 0x2b6cb0,
    title: "École de Gendarmerie de Fontainebleau",
    description:
      `${interaction.user}, vous avez ouvert une procédure pour intégrer le parcours **Sous-Officier de Gendarmerie (ESOG)**.\n\n` +
      "📌 Vous remplissez les critères demandés et êtes enregistré comme candidat.\n" +
      "Cliquez sur **« Finaliser mon dossier »** pour accéder au formulaire officiel.\n" +
      "Un recruteur reviendra vers vous après étude de votre dossier.",
    image: {
      url: "https://cdn.discordapp.com/attachments/1436686300773224468/1436686461381378069/Capture_decran_2025-11-08_131208.png?ex=69108208&is=690f3088&hm=285bd048eabd1f88cffb9f1d864020ad91b8ea76ba7227994e0e3f7a6b1150f7&",
    },
    footer: {
      text:
        "CIR - Région d'Île-de-France  • " +
        new Date().toLocaleString("fr-FR"),
    },
  };

  await channel.send({
    content: `${interaction.user}`,
    embeds: [embed],
    components: [row],
  });

  await interaction.reply({
    content: `📁 Votre dossier de candidature ESOG a été créé : ${channel}`,
    ephemeral: true,
  });
}

// ---------- EGAV : création du salon avec réponses du modal ----------
async function createEgavDossierFromModal(
  interaction,
  { nom, prenom, age, motivation }
) {
  const guild = interaction.guild;

  const existing = guild.channels.cache.find(
    (ch) =>
      ch.parentId === CATEGORY_GAV_ID &&
      ch.type === ChannelType.GuildText &&
      ch.topic === `dossier-EGAV-${interaction.user.id}`
  );
  if (existing) {
    await existing.send(
      `🔁 ${interaction.user} a soumis à nouveau ses informations.\n` +
        `**Nom :** ${nom}\n**Prénom :** ${prenom}\n**Âge (IRL) :** ${age}\n**Motivation :** ${motivation}`
    );
    return interaction.reply({
      content: `📁 Vous aviez déjà un salon EGAV, vos nouvelles informations ont été ajoutées ici : ${existing}`,
      ephemeral: true,
    });
  }

  const safeName = `dossier-egav-${interaction.user.username}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");

  const channel = await guild.channels.create({
    name: safeName,
    type: ChannelType.GuildText,
    parent: CATEGORY_GAV_ID,
    topic: `dossier-EGAV-${interaction.user.id}`,
    permissionOverwrites: [
      {
        id: guild.roles.everyone,
        deny: [PermissionsBitField.Flags.ViewChannel],
      },
      {
        id: interaction.user.id,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ReadMessageHistory,
        ],
      },
      // ➕ rôle recruteur ici si besoin
    ],
  });

  const embed = {
    color: 0x2b6cb0,
    title: "École de Gendarmerie de Fontainebleau",
    description:
      `${interaction.user}, vous avez ouvert une procédure pour intégrer le parcours **Gendarme Adjoint Volontaire (EGAV)**.\n\n` +
      "📌 Voici les informations que vous avez fournies :",
    fields: [
      { name: "Nom", value: nom || "Non renseigné", inline: true },
      { name: "Prénom", value: prenom || "Non renseigné", inline: true },
      { name: "Âge (IRL)", value: age || "Non renseigné", inline: true },
      {
        name: "Motivation",
        value: motivation || "Non renseignée",
        inline: false,
      },
    ],
    image: {
      url: "https://cdn.discordapp.com/attachments/1436686300773224468/1436686461381378069/Capture_decran_2025-11-08_131208.png?ex=69108208&is=690f3088&hm=285bd048eabd1f88cffb9f1d864020ad91b8ea76ba7227994e0e3f7a6b1150f7&",
    },
    footer: {
      text:
        "CIR - Région d'Île-de-France • " +
        new Date().toLocaleString("fr-FR"),
    },
  };

  await channel.send({
    content: `${interaction.user}`,
    embeds: [embed],
  });

  await interaction.reply({
    content: `📁 Votre dossier de candidature EGAV a été créé : ${channel}`,
    ephemeral: true,
  });
}

// ---------- CONTACT : création du salon privé ----------
async function createContactChannel(interaction, motifLabel) {
  const guild = interaction.guild;

  // Vérifier si un salon existe déjà pour cet utilisateur
  const existing = guild.channels.cache.find(
    (ch) =>
      ch.parentId === CONTACT_CATEGORY_ID &&
      ch.type === ChannelType.GuildText &&
      ch.topic === `contact-${interaction.user.id}`
  );

  if (existing) {
    await existing.send(
      `🔁 ${interaction.user} a de nouveau sélectionné **${motifLabel}**. Merci de préciser votre demande ci-dessous.`
    );

    return interaction.reply({
      content: `📁 Vous avez déjà un salon de contact ouvert : ${existing}`,
      ephemeral: true,
    });
  }

  const safeName = `contact-${interaction.user.username}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");

  const channel = await guild.channels.create({
    name: safeName,
    type: ChannelType.GuildText,
    parent: CONTACT_CATEGORY_ID,
    topic: `contact-${interaction.user.id}`,
    permissionOverwrites: [
      {
        id: guild.roles.everyone,
        deny: [PermissionsBitField.Flags.ViewChannel],
      },
      {
        id: interaction.user.id,
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ReadMessageHistory,
        ],
      },
      {
        id: GENDARMES_ROLE_ID, // rôle gendarme / staff
        allow: [
          PermissionsBitField.Flags.ViewChannel,
          PermissionsBitField.Flags.SendMessages,
          PermissionsBitField.Flags.ReadMessageHistory,
        ],
      },
    ],
  });

  const embed = {
    color: 0x2b6cb0,
    title: "🏛️ Centre de Contact Officiel - Gendarmerie Nationale",
    description:
      `${interaction.user}, vous avez ouvert un contact pour : **${motifLabel}**.\n\n` +
      "Merci d’indiquer ci-dessous de manière claire et précise l’objet de votre demande.\n" +
      "Un gendarme de la région **Île-de-France (77)** vous répondra dans les plus brefs délais.",
    footer: {
      text:
        "Gendarmerie Nationale • Région Île-de-France (77) • " +
        new Date().toLocaleString("fr-FR"),
    },
  };

  await channel.send({
    content: `${interaction.user}`,
    embeds: [embed],
  });

  await interaction.reply({
    content: `✅ Votre salon de contact a été créé : ${channel}`,
    ephemeral: true,
  });
}

// ===================== GESTION DES INTERACTIONS =====================

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    // ----- MENU CONTACT -----
    if (
      interaction.isStringSelectMenu() &&
      interaction.customId === "contact_menu"
    ) {
      const choice = interaction.values[0];
      let motifLabel = "";

      switch (choice) {
        case "prise_contact":
          motifLabel = "Prise de contact";
          break;
        case "contact_compagnie":
          motifLabel = "Contact Compagnie";
          break;
        case "deposer_plainte":
          motifLabel = "Déposer une plainte";
          break;
        case "contact_iggn":
          motifLabel = "Contact IGGN";
          break;
        default:
          motifLabel = "Contact";
          break;
      }

      await createContactChannel(interaction, motifLabel);
      return;
    }

    // ----- SLASH COMMANDS -----
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      await command.execute(interaction);
      return;
    }

    // ----- MENU DE RECRUTEMENT -----
    if (
      interaction.isStringSelectMenu() &&
      interaction.customId === "recrutement_menu"
    ) {
      const choix = interaction.values[0];
      console.log("📩 Menu reçu :", choix);

      if (choix === "sog") {
        await createSogDossier(interaction);
        return;
      }

      if (choix === "gav") {
        const modal = new ModalBuilder()
          .setCustomId("egav_dossier")
          .setTitle("Dossier Gendarme Adjoint Volontaire");

        const nom = new TextInputBuilder()
          .setCustomId("egav_nom")
          .setLabel("Nom")
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        const prenom = new TextInputBuilder()
          .setCustomId("egav_prenom")
          .setLabel("Prénom")
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        const age = new TextInputBuilder()
          .setCustomId("egav_age")
          .setLabel("Âge (IRL)")
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        const motivation = new TextInputBuilder()
          .setCustomId("egav_motivation")
          .setLabel("Motivation")
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true);

        const row1 = new ActionRowBuilder().addComponents(nom);
        const row2 = new ActionRowBuilder().addComponents(prenom);
        const row3 = new ActionRowBuilder().addComponents(age);
        const row4 = new ActionRowBuilder().addComponents(motivation);

        modal.addComponents(row1, row2, row3, row4);

        await interaction.showModal(modal);
        return;
      }

      return;
    }

    // ----- SOUMISSION FORMULAIRE EGAV -----
    if (interaction.isModalSubmit() && interaction.customId === "egav_dossier") {
      const nom = interaction.fields.getTextInputValue("egav_nom");
      const prenom = interaction.fields.getTextInputValue("egav_prenom");
      const age = interaction.fields.getTextInputValue("egav_age");
      const motivation = interaction.fields.getTextInputValue(
        "egav_motivation"
      );

      await createEgavDossierFromModal(interaction, {
        nom,
        prenom,
        age,
        motivation,
      });
      return;
    }

    // ----- BOUTON "FINALISER MON DOSSIER" SOG -----
    if (interaction.isButton() && interaction.customId === "sog_finaliser") {
      await interaction.reply({
        content:
          `📋 Pour finaliser votre dossier **Sous-Officier de Gendarmerie (ESOG)**, veuillez remplir ce formulaire :\n${SOG_FORM_URL}`,
        ephemeral: true,
      });
      return;
    }
  } catch (error) {
    console.error("❌ Erreur dans InteractionCreate :", error);
    if (!interaction.replied && !interaction.deferred) {
      try {
        await interaction.reply({
          content:
            "❌ Une erreur est survenue lors du traitement de votre demande.",
          ephemeral: true,
        });
      } catch {
        // ignore
      }
    }
  }
});

// === CONNEXION ===
client.login(process.env.TOKEN);
