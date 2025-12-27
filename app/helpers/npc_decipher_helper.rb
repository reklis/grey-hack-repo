# frozen_string_literal: true

module NpcDecipherHelper
  def password_count
    @password_count ||= if PRECOMPUTED_HASHES_FILE.exist?
      `wc -l < #{PRECOMPUTED_HASHES_FILE}`.to_i
    else
      0
    end
  end
end
