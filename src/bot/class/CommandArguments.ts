import { Attachment, AutocompleteInteraction, Channel, CommandInteraction, CommandInteractionOptionResolver, GuildBasedChannel, GuildMember, Role, User } from "discord.js";

type ArgumentType = string | number | boolean;

export class CommandArguments {
    private interaction: CommandInteraction | AutocompleteInteraction;
    private argMap: {[key: string]: string};

    constructor(argMap: {[key: string]: string}, interaction: CommandInteraction | AutocompleteInteraction) {
        this.argMap = argMap;
        this.interaction = interaction;
    }

    public getArgumentName(id: string): string {
        return this.argMap[id];
    }

    public has(id: string): boolean {
        return this.interaction.options.get(this.getArgumentName(id)) !== null;
    }

    public get<T extends ArgumentType>(id: string): T {
        const val = this.interaction.options.get(this.getArgumentName(id))?.value;
        return <T>val;
    }

    public getChannel(id: string): GuildBasedChannel {
        const val = this.interaction.options.get(this.getArgumentName(id))?.channel;
        return <GuildBasedChannel>val;
    }

    public getMember(id: string): GuildMember {
        const val = this.interaction.options.get(this.getArgumentName(id))?.member;
        return <GuildMember>val;
    }

    public getUser(id: string): User {
        const val = this.interaction.options.get(this.getArgumentName(id))?.user;
        return <User>val;
    }

    public getRole(id: string): Role {
        const val = this.interaction.options.get(this.getArgumentName(id))?.role;
        return <Role>val;
    }

    public getAttachment(id: string): Attachment {
        const val = this.interaction.options.get(this.getArgumentName(id))?.attachment;
        return <Attachment>val;
    }

    public getSubcommand(): string {
        const val = (<CommandInteractionOptionResolver>this.interaction.options).getSubcommand();
        return val;
    }
}