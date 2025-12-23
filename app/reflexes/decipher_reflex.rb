# frozen_string_literal: true

class DecipherReflex < ApplicationReflex
  def deciphe(value)
    result = value.split("\n").map do |line|
      values = line.split(":")
      hash = values[-1].strip.downcase
      values[-1] = PASSWORDS[hash] || values[-1]
      values.join(":")
    end.join("\n")
    morph "#result", result || "no result"
  end
end
