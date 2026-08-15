import { EmbedBuilder, PermissionFlags, type Client, type Message } from '@fluxerjs/core';
import type { Command } from '../types.js';
import { sendToChannel } from '../lib/util.js';

const command: Command = {
  name: 'addrole',
  description: 'Add a role to a user.',
  category: 'Moderation',
  async execute(message: Message, args: string[], client: Client) {
    if (!message.guildId) return;
    const guild = client.guilds.get(message.guildId);
    if (!guild) return;

    const invoker = await guild.members.resolve(message.author.id);

    const err = (desc: string) =>
      sendToChannel(message, { embeds: [new EmbedBuilder().setColor('#ED4245').setDescription(desc)] });

    if (!invoker?.permissions.has(PermissionFlags.ManageRoles))
      return err("You don't have permission to manage roles!");

    const botMember = await guild.members.fetchMe?.().catch(() => null);
    if (botMember && !botMember.permissions.has(PermissionFlags.ManageRoles))
      return err("I don't have permission to manage roles!");

    const target = message.mentions?.[0];
    if (!target) return err('Please mention a user to add a role to!\nUsage: `addrole @user @role` or `addrole @user role name`');

    const targetMember = await guild.members.resolve(target.id);

    // Try role mention first, then by name from remaining args
    const mentionedRoleId = message.mentionRoles?.[0];
    let role = mentionedRoleId ? guild.roles?.get(mentionedRoleId) : null;

    if (!role) {
      const roleName = args.slice(1).join(' ');
      if (!roleName) return err('Please specify a role!\nUsage: `addrole @user @role` or `addrole @user role name`');
      role = [...(guild.roles?.values() ?? [])].find((r) => r.name.toLowerCase() === roleName.toLowerCase()) ?? null;
      if (!role) return err(`Could not find a role named "${roleName}"!`);
    }

    if (targetMember?.roles.has(role.id))
      return sendToChannel(message, {
        embeds: [new EmbedBuilder().setColor('#FFA500').setDescription(`⚠️ ${target.username} already has the **${role.name}** role!`)],
      });

    try {
      await targetMember?.roles.add(role.id);
      await sendToChannel(message, {
        embeds: [
          new EmbedBuilder()
            .setColor('#57F287')
            .setDescription(`Successfully added **${role.name}** to ${target.username}!`)
            .setTimestamp(new Date()),
        ],
      });
    } catch (error) {
      console.error(error);
      await err('An error occurred while trying to add the role!');
    }
  },
};

export default command;
