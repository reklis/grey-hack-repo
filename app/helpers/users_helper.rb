# frozen_string_literal: true

module UsersHelper
  def user_avatar(user)
    if user&.avatar_image&.attached?
      rails_storage_proxy_path(user.avatar_image)
    else
      default_avatar
    end
  end

  def current_user_avatar
    if current_user
      user_avatar(current_user)
    else
      default_avatar
    end
  end

  private

  def default_avatar
    "/images/defaultavatar.png"
  end
end
