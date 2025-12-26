# frozen_string_literal: true

class Layout::Toggle < ApplicationComponent
  renders_one :toggle, lambda { |**kwargs|
    if @disabled == false
      kwargs[:data] ||= {}
      kwargs[:data][:action] = "click->toggle#toggle touch->toggle#toggle"
    end

    Layout::BaseComponent.new(**kwargs)
  }

  renders_one :toggleable, lambda { |**kwargs|
    if @disabled == false
      kwargs[:data] ||= {}
      kwargs[:data][:toggle_target] = "toggleable"
    end
    if @open == false
      kwargs[:class] ||= "hidden"
      kwargs[:class] += " hidden" if kwargs[:class].index("hidden").nil?
    end

    Layout::BaseComponent.new(**kwargs)
  }

  def initialize(tag: :div, open: false, disabled: false, **sys_params)
    @sys_params = sys_params
    @open = open
    @disabled = disabled
    @tag = tag
    @sys_params[:data] ||= {}
    @sys_params[:data][:controller] = "toggle"
  end
end
