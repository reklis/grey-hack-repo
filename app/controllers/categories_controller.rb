# frozen_string_literal: true

class CategoriesController < ApplicationController
  include SortablePosts

  def show
    @category = Category.friendly.find(params[:id])
    set_posts
    @posts = @posts.search(params[:query]["title"]) if params[:query]

    begin
      @pagy, @posts = pagy @posts.where(category: @category)
    rescue Pagy::OverflowError
      params[:page] = 1
      retry
    end
  end
end
