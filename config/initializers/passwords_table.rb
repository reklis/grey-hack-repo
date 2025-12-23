# frozen_string_literal: true

puts "Loading precomputed password hashes..."

PASSWORDS = {}
precomputed_file = Rails.root.join("wordlists", "precomputed_hashes.txt")

if precomputed_file.exist?
  File.foreach(precomputed_file, chomp: true) do |line|
    hash, password = line.split(":", 2)
    PASSWORDS[hash] = password if hash && password
  end
  puts "Loaded #{PASSWORDS.size} password hashes"
else
  puts "Warning: precomputed_hashes.txt not found"
end
