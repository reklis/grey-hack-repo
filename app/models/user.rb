# frozen_string_literal: true

# == Schema Information
#
# Table name: users
#
#  id                     :bigint           not null, primary key
#  admin                  :boolean
#  avatar                 :string
#  bank                   :string
#  banner_data            :text
#  btc                    :string
#  confirmation_sent_at   :datetime
#  confirmation_token     :string
#  confirmed_at           :datetime
#  email                  :string           not null
#  encrypted_password     :string           default(""), not null
#  name                   :string           not null
#  provider               :string
#  remember_created_at    :datetime
#  reset_password_sent_at :datetime
#  reset_password_token   :string
#  supporter              :boolean
#  uid                    :string
#  unconfirmed_email      :string
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#
# Indexes
#
#  index_users_on_confirmation_token  (confirmation_token) UNIQUE
#  index_users_on_name                (name) UNIQUE
#
class User < ApplicationRecord
  extend FriendlyId

  devise :database_authenticatable, :registerable, :rememberable, :validatable, :confirmable, :recoverable
  friendly_id :name

  validates :name, length: {maximum: 16, minimum: 3}, presence: true, uniqueness: true, format: {with: /(^[\d\w-]*$)/, message: "name can only include letters numbers and _ -"}
  # validates :password, length: {minimum: 6, maximum: 32}, presence: true
  validates :btc, length: {minimum: 2, maximum: 32, allow_blank: true}
  validates :bank, length: {is: 8, allow_blank: true}

  has_many :posts, dependent: :destroy
  has_many :gists, dependent: :destroy
  has_many :stars, dependent: :destroy
  has_many :starable_posts, through: :stars, source: "starable", source_type: "Post"
  has_many :comments, dependent: :destroy
  has_many :notifications, as: :recipient, dependent: :destroy, class_name: "Noticed::Notification"
  has_many :guilds_users, dependent: :destroy
  has_many :member_guilds, through: :guilds_users, source: :guild
  has_one :owner_guild, class_name: "Guild", foreign_key: :user_id, dependent: :destroy
  has_one_attached :avatar_image, dependent: :destroy
  has_one_attached :banner_image, dependent: :destroy

  def display_name
    if guild&.tag&.empty? == false
      "[#{guild.tag}] #{name}"
    else
      name
    end
  end

  def self.anonymous_user
    OpenStruct.new(
      name: "anonymous",
      avatar: "https://i.imgur.com/LHv2STe.png",
      email: "bob.shadow@gmail.com"
    )
  end

  def guild
    # TODO make users able to  join in more than 1 guild
    owner_guild || member_guilds.first
  end

  protected

  # Queue Devise emails via Sidekiq instead of sending synchronously
  def send_devise_notification(notification, *args)
    devise_mailer.send(notification, self, *args).deliver_later
  end
end
