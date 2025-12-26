# frozen_string_literal: true

# To deliver this notification:
#
# GuildInviteNotifier.with(user: @user, guild: @guild).deliver(recipient)

class GuildInviteNotifier < Noticed::Event
  deliver_by :database

  required_params :user, :guild
end
