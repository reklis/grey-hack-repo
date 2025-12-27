class InvitePolicy < ApplicationPolicy
  def create?
    if record.guild.nil?
      false
    else
      record.guild.user == user
    end
  end

  def accept?
    !(user.nil? || user != record.user)
  end

  def destroy?
    !(user.nil? || user != record.user)
  end
end
