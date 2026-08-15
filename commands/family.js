import { EmbedBuilder } from '@fluxerjs/core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.join(__dirname, '../data/familytree/family.json');
const PREFIX = process.env.prefix || 'i>';

const PROPOSAL_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
const COLOR = 6086089;

if (!fs.existsSync(path.dirname(FILE))) fs.mkdirSync(path.dirname(FILE), { recursive: true });
if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, '{}');

function load() { return JSON.parse(fs.readFileSync(FILE)); }
function save(data) { fs.writeFileSync(FILE, JSON.stringify(data, null, 2)); }

function ensureGuild(data, guildId) {
  if (!data[guildId]) data[guildId] = {};
  if (!data[guildId].__proposals) data[guildId].__proposals = {};
}

function ensureUser(data, guildId, userId) {
  ensureGuild(data, guildId);
  if (!data[guildId][userId]) {
    data[guildId][userId] = { parents: [], children: [], spouse: null };
  } else {
    if (data[guildId][userId].spouse === undefined) data[guildId][userId].spouse = null;
  }
}

function mention(id) { return `<@${id}>`; }

function getUser(data, guildId, userId) {
  return data[guildId]?.[userId] ?? { parents: [], children: [], spouse: null };
}

function getSiblings(data, guildId, userId) {
  const family = getUser(data, guildId, userId);
  if (!family.parents.length) return [];
  return Object.entries(data[guildId])
    .filter(([uid, info]) => uid !== '__proposals' && uid !== userId && info.parents?.some(p => family.parents.includes(p)))
    .map(([uid]) => uid);
}

function getAncestors(data, guildId, userId, maxDepth = 10) {
  const seen = new Set();
  let frontier = [userId];
  let depth = 0;
  while (frontier.length && depth < maxDepth) {
    const next = [];
    for (const id of frontier) {
      for (const parentId of getUser(data, guildId, id).parents) {
        if (!seen.has(parentId)) { seen.add(parentId); next.push(parentId); }
      }
    }
    frontier = next;
    depth++;
  }
  return seen;
}

function clearExpiredProposals(data, guildId) {
  const proposals = data[guildId].__proposals;
  const now = Date.now();
  for (const [targetId, p] of Object.entries(proposals)) {
    if (now - p.timestamp > PROPOSAL_TIMEOUT_MS) delete proposals[targetId];
  }
}

function embed(title) {
  return new EmbedBuilder().setTitle(title).setColor(COLOR).setTimestamp(new Date());
}

function errorEmbed(desc) {
  return new EmbedBuilder().setColor('Red').setDescription(desc).setTimestamp(new Date());
}

function buildTreeFields(data, guildId, userId, displayName) {
  const family = getUser(data, guildId, userId);
  const parents = family.parents.length ? family.parents.map(mention).join('\n') : 'None';
  const spouse = family.spouse ? mention(family.spouse) : 'None';
  const children = family.children.length ? family.children.map(mention).join('\n') : 'None';
  const siblings = getSiblings(data, guildId, userId);
  const siblingsStr = siblings.length ? siblings.map(mention).join('\n') : 'None';

  return new EmbedBuilder()
    .setTitle(`${displayName}'s Family Tree`)
    .addFields(
      { name: '👨‍👩‍👧 Parents',  value: parents,     inline: true },
      { name: '💍 Spouse',      value: spouse,      inline: true },
      { name: '🧑‍🤝‍🧑 Siblings', value: siblingsStr, inline: true },
      { name: '👶 Children',    value: children },
    )
    .setColor(COLOR)
    .setTimestamp(new Date())
    .setFooter({ text: `Use \`${PREFIX}family tree\` for a multi-generation view · \`${PREFIX}family help\` for commands` });
}

function buildBigTree(data, guildId, userId, displayName) {
  const family = getUser(data, guildId, userId);
  const lines = [];

  const grandparents = family.parents.flatMap(pid => getUser(data, guildId, pid).parents);
  if (grandparents.length) lines.push(`Grandparents: ${grandparents.map(mention).join(', ')}`);

  lines.push(`${family.parents.length ? family.parents.map(mention).join(' & ') + '\n  └─ ' : ''}${family.spouse ? `**${displayName}** 💍 ${mention(family.spouse)}` : `**${displayName}**`}`);

  if (family.children.length) {
    for (const childId of family.children) {
      const grandchildren = getUser(data, guildId, childId).children;
      lines.push(`      └─ ${mention(childId)}${grandchildren.length ? `\n            └─ ${grandchildren.map(mention).join(', ')}` : ''}`);
    }
  } else {
    lines.push('      └─ (no children)');
  }

  return lines.join('\n');
}

export default {
  name: 'family',
  aliases: ['fam'],
  description: 'Marry, adopt, and manage your server family tree.',
  category: 'Fun',
  usage: '[@user] | marry/adopt @user | accept | decline | cancel | divorce | disown @user | leave @user | tree [@user] | help',
  async execute(message, args, client) {
    const guildId = message.guildId;
    const userId = message.author.id;
    const data = load();

    ensureGuild(data, guildId);
    ensureUser(data, guildId, userId);
    clearExpiredProposals(data, guildId);

    const sub = args[0]?.toLowerCase();
    const mentionedTarget = message.mentions?.[0];

    const send = (e) => message.channel.send({ embeds: [e] });
    const fail = (desc) => send(errorEmbed(desc));

    // ---- i>family help ----
    if (sub === 'help') {
      const helpEmbed = embed('👪 Family Command Help')
        .setDescription(
          [
            `\`${PREFIX}family\` — view your own family tree`,
            `\`${PREFIX}family @user\` — view someone else's family tree`,
            `\`${PREFIX}family tree [@user]\` — see a multi-generation tree`,
            `\`${PREFIX}family marry @user\` — propose marriage`,
            `\`${PREFIX}family adopt @user\` — propose adopting @user as your child`,
            `\`${PREFIX}family accept\` — accept a proposal sent to you`,
            `\`${PREFIX}family decline\` — decline a proposal sent to you`,
            `\`${PREFIX}family cancel\` — cancel a proposal you sent`,
            `\`${PREFIX}family divorce\` — divorce your spouse`,
            `\`${PREFIX}family disown @user\` — remove @user as your child`,
            `\`${PREFIX}family leave @user\` — remove @user as your parent`,
          ].join('\n')
        );
      return send(helpEmbed);
    }

    const KNOWN_SUBS = ['tree', 'marry', 'adopt', 'accept', 'decline', 'cancel', 'divorce', 'disown', 'leave'];

    if (!sub || !KNOWN_SUBS.includes(sub)) {
      if (sub && !mentionedTarget) {
        return fail(`Unknown subcommand \`${sub}\`. Run \`${PREFIX}family help\` to see everything you can do.`);
      }
      const targetId = mentionedTarget ? mentionedTarget.id : userId;
      const targetName = mentionedTarget ? mentionedTarget.username : message.author.username;
      ensureUser(data, guildId, targetId);
      save(data);
      return send(buildTreeFields(data, guildId, targetId, targetName));
    }

    // ---- i>family tree [@user] ----
    if (sub === 'tree') {
      const targetId = mentionedTarget ? mentionedTarget.id : userId;
      const targetName = mentionedTarget ? mentionedTarget.username : message.author.username;
      ensureUser(data, guildId, targetId);
      save(data);
      return send(embed(`🌳 ${targetName}'s Extended Family Tree`).setDescription(buildBigTree(data, guildId, targetId, targetName)));
    }

    // ---- proposal-based commands: marry / adopt ----
    if (sub === 'marry' || sub === 'adopt') {
      if (!mentionedTarget) return fail(`Please mention a user.\nUsage: \`${PREFIX}family ${sub} @user\``);
      const targetId = mentionedTarget.id;
      if (targetId === userId) return fail(`You can't ${sub === 'marry' ? 'marry' : 'adopt'} yourself!`);
      if (mentionedTarget.bot) return fail(`You can't ${sub === 'marry' ? 'marry' : 'adopt'} a bot!`);

      ensureUser(data, guildId, targetId);
      const userData = getUser(data, guildId, userId);
      const targetData = getUser(data, guildId, targetId);

      if (sub === 'marry') {
        if (userData.spouse) return fail(`You're already married to ${mention(userData.spouse)}! Use \`${PREFIX}family divorce\` first.`);
        if (targetData.spouse) return fail(`${mention(targetId)} is already married to someone else.`);

        const related =
          userData.parents.includes(targetId) ||
          userData.children.includes(targetId) ||
          getSiblings(data, guildId, userId).includes(targetId);
        if (related) return fail("You can't marry a family member!");
      } else {
        // adopt: proposer wants to become the target's parent
        if (userData.children.includes(targetId)) return fail(`${mention(targetId)} is already your child.`);
        if (userData.parents.includes(targetId)) return fail("You can't adopt your own parent!");
        if (getAncestors(data, guildId, userId, 20).has(targetId)) {
          return fail("You can't adopt one of your own ancestors — that would create a loop in the tree!");
        }
      }

      const existingProposal = data[guildId].__proposals[targetId];
      if (existingProposal) {
        if (existingProposal.from === userId && existingProposal.type === sub) {
          return fail(`You already have a pending ${sub} proposal to ${mention(targetId)}.`);
        }
        return fail(`${mention(targetId)} already has a pending proposal. They need to \`accept\` or \`decline\` it first.`);
      }

      data[guildId].__proposals[targetId] = { from: userId, type: sub, timestamp: Date.now() };
      save(data);

      const verb = sub === 'marry' ? 'proposed marriage to' : 'asked to adopt';
      return send(
        embed(sub === 'marry' ? '💍 Marriage Proposal' : '📜 Adoption Request')
          .setDescription(
            `${mention(userId)} has ${verb} ${mention(targetId)}!\n\n` +
            `${mention(targetId)}, type \`${PREFIX}family accept\` to accept or \`${PREFIX}family decline\` to decline.\n` +
            `This request expires in 10 minutes.`
          )
      );
    }

    // ---- i>family accept ----
    if (sub === 'accept') {
      const proposal = data[guildId].__proposals[userId];
      if (!proposal) return fail("You don't have any pending proposals.");

      const fromId = proposal.from;
      ensureUser(data, guildId, fromId);
      const fromData = getUser(data, guildId, fromId);
      const userData = getUser(data, guildId, userId);

      if (proposal.type === 'marry') {
        if (fromData.spouse || userData.spouse) {
          delete data[guildId].__proposals[userId];
          save(data);
          return fail('One of you already got married in the meantime — proposal cancelled.');
        }
        fromData.spouse = userId;
        userData.spouse = fromId;
        delete data[guildId].__proposals[userId];
        save(data);
        return send(embed('💍 Married!').setDescription(`${mention(fromId)} and ${mention(userId)} are now married! 🎉`));
      }

      if (proposal.type === 'adopt') {
        if (!fromData.children.includes(userId)) fromData.children.push(userId);
        if (!userData.parents.includes(fromId)) userData.parents.push(fromId);
        delete data[guildId].__proposals[userId];
        save(data);
        return send(embed('📜 Adoption Complete').setDescription(`${mention(userId)} is now ${mention(fromId)}'s child! 🎉`));
      }
    }

    // ---- i>family decline ----
    if (sub === 'decline') {
      const proposal = data[guildId].__proposals[userId];
      if (!proposal) return fail("You don't have any pending proposals.");
      delete data[guildId].__proposals[userId];
      save(data);
      return send(embed('Proposal Declined').setDescription(`${mention(userId)} declined the proposal from ${mention(proposal.from)}.`));
    }

    // ---- i>family cancel ----
    if (sub === 'cancel') {
      const entry = Object.entries(data[guildId].__proposals).find(([, p]) => p.from === userId);
      if (!entry) return fail("You don't have any outgoing proposals to cancel.");
      delete data[guildId].__proposals[entry[0]];
      save(data);
      return send(embed('Proposal Cancelled').setDescription(`Your proposal to ${mention(entry[0])} was cancelled.`));
    }

    // ---- i>family divorce ----
    if (sub === 'divorce') {
      const userData = getUser(data, guildId, userId);
      if (!userData.spouse) return fail("You're not married to anyone.");
      const spouseId = userData.spouse;
      ensureUser(data, guildId, spouseId);
      const spouseData = getUser(data, guildId, spouseId);
      userData.spouse = null;
      spouseData.spouse = null;
      save(data);
      return send(embed('💔 Divorced').setDescription(`${mention(userId)} and ${mention(spouseId)} are no longer married.`));
    }

    // ---- i>family disown @user ----
    if (sub === 'disown') {
      if (!mentionedTarget) return fail(`Please mention a user.\nUsage: \`${PREFIX}family disown @user\``);
      const targetId = mentionedTarget.id;
      const userData = getUser(data, guildId, userId);
      if (!userData.children.includes(targetId)) return fail(`${mention(targetId)} isn't your child.`);
      ensureUser(data, guildId, targetId);
      const targetData = getUser(data, guildId, targetId);
      userData.children = userData.children.filter(id => id !== targetId);
      targetData.parents = targetData.parents.filter(id => id !== userId);
      save(data);
      return send(embed('Disowned').setDescription(`${mention(targetId)} is no longer ${mention(userId)}'s child.`));
    }

    // ---- i>family leave @user ----
    if (sub === 'leave') {
      if (!mentionedTarget) return fail(`Please mention a user.\nUsage: \`${PREFIX}family leave @user\``);
      const targetId = mentionedTarget.id;
      const userData = getUser(data, guildId, userId);
      if (!userData.parents.includes(targetId)) return fail(`${mention(targetId)} isn't your parent.`);
      ensureUser(data, guildId, targetId);
      const targetData = getUser(data, guildId, targetId);
      userData.parents = userData.parents.filter(id => id !== targetId);
      targetData.children = targetData.children.filter(id => id !== userId);
      save(data);
      return send(embed('Left Family').setDescription(`${mention(userId)} is no longer ${mention(targetId)}'s child.`));
    }

    return fail(`Unknown subcommand. Run \`${PREFIX}family help\` to see everything you can do.`);
  },
};
