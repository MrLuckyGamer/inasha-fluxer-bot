import { EmbedBuilder, PermissionFlags } from '@fluxerjs/core';

export default {
  name: 'removerole',
  description: 'Remove a role from a user.',
  category: 'Moderation',
  async execute(message, args, client) {
    const guild = client.guilds.get(message.guildId);
    if (!guild) return;

    const invoker = await guild.members.resolve(message.author.id);
    const err = (desc) => message.channel.send({ embeds: [new EmbedBuilder().setColor('#ED4245').setDescription(desc)] });

    if (!invoker?.permissions.has(PermissionFlags.ManageRoles))
      return err("You don't have permission to manage roles!");

    const botMember = await guild.members.fetchMe?.().catch(() => null);
    if (botMember && !botMember.permissions.has(PermissionFlags.ManageRoles))
      return err("I don't have permission to manage roles!");

    const target = message.mentions?.[0];
    if (!target) return err('Please mention a user to remove a role from!\nUsage: `removerole @user @role` or `removerole @user role name`');

    const targetMember = await guild.members.resolve(target.id);

    const mentionedRoleId = message.mentionRoles?.[0];
    let role = mentionedRoleId ? guild.roles?.get(mentionedRoleId) : null;

    if (!role) {
      const roleName = args.slice(1).join(' ');
      if (!roleName) return err('Please specify a role!\nUsage: `removerole @user @role` or `removerole @user role name`');
      role = [...(guild.roles?.values() ?? [])].find(r => r.name.toLowerCase() === roleName.toLowerCase());
      if (!role) return err(`Could not find a role named "${roleName}"!`);
    }

    if (!targetMember?.roles.has(role.id))
      return message.channel.send({ embeds: [new EmbedBuilder().setColor('#FFA500').setDescription(`${target.username} doesn't have the **${role.name}** role!`)] });

    try {
      await targetMember?.roles.remove(role.id);
      await message.channel.send({ embeds: [new EmbedBuilder().setColor('#57F287').setDescription(`Successfully removed **${role.name}** from ${target.username}!`).setTimestamp(new Date())] });
    } catch (error) {
      console.error(error);
      await err('An error occurred while trying to remove the role!');
    }
  },
};
