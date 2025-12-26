# frozen_string_literal: true

module AnnouncementsHelper
  def announcement_media(announcement)
    if announcement&.media&.attached?
      rails_storage_proxy_path(announcement.media)
    end
  end
end
