# frozen_string_literal: true

module GuildsHelper
  def guild_avatar(guild)
    if guild&.avatar&.attached?
      rails_storage_proxy_path(guild.avatar)
    else
      "/images/defaultavatar.png"
    end
  end

  def guild_banner(guild)
    if guild&.banner&.attached?
      rails_storage_proxy_path(guild.banner)
    else
      "/images/userbanner2.svg"
    end
  end

  def guild_badge(guild)
    if guild&.badge&.attached?
      rails_storage_proxy_path(guild.badge)
    else
      "/images/userbanner2.svg"
    end
  end
end
