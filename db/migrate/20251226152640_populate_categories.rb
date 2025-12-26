# frozen_string_literal: true

class PopulateCategories < ActiveRecord::Migration[7.0]
  def up
    Category.find_or_create_by!(name: "Scripts") do |c|
      c.icon = "file"
      c.description = "one file scripts, usually simple command line programs that provides some quality of life improvements"
    end

    Category.find_or_create_by!(name: "Programs") do |c|
      c.icon = "terminal"
      c.description = "programs with one or more files that do complex things, example: games, hacking tools, network mapping etc"
    end

    Category.find_or_create_by!(name: "Modules") do |c|
      c.icon = "code-square"
      c.description = "code snippets that can be imported in your program to speed development"
    end
  end

  def down
    Category.where(name: ["Scripts", "Programs", "Modules"]).destroy_all
  end
end
