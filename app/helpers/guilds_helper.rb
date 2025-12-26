# frozen_string_literal: true

module GuildsHelper
  def guild_avatar(guild)
    if guild&.avatar&.attached?
      rails_storage_proxy_path(guild.avatar)
    else
      image_url("defaultavatar.png")
    end
  end

  def guild_banner(guild)
    if guild&.banner&.attached?
      rails_storage_proxy_path(guild.banner)
    else
      image_url("userbanner2.svg")
    end
  end

  def guild_badge(guild)
    if guild&.badge&.attached?
      rails_storage_proxy_path(guild.badge)
    else
      image_url("userbanner2.svg")
    end
  end
end
