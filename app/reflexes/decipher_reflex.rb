# frozen_string_literal: true

require "shellwords"

class DecipherReflex < ApplicationReflex
  def deciphe(value)
    hashes = value.split("\n").map { |line| line.split(":")[-1].strip.downcase }
    passwords = lookup_passwords(hashes)

    result = value.split("\n").map do |line|
      values = line.split(":")
      hash = values[-1].strip.downcase
      values[-1] = passwords[hash] || values[-1]
      values.join(":")
    end.join("\n")
    morph "#result", result || "no result"
  end

  private

  def lookup_passwords(hashes)
    return {} if hashes.empty? || !PRECOMPUTED_HASHES_FILE.exist?

    pattern = hashes.map { |h| "^#{Regexp.escape(h)}:" }.join("|")
    output = `grep -E #{Shellwords.escape(pattern)} #{Shellwords.escape(PRECOMPUTED_HASHES_FILE.to_s)} 2>/dev/null`

    output.lines.each_with_object({}) do |line, result|
      hash, password = line.chomp.split(":", 2)
      result[hash] = password if hash && password
    end
  end
end
