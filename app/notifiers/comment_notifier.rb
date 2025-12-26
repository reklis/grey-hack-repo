# frozen_string_literal: true

# To deliver this notification:
#
# CommentNotifier.with(record: @comment).deliver(recipient)

class CommentNotifier < Noticed::Event
  deliver_by :database

  notification_methods do
    def message
      comment = event.record
      if comment.commentable.instance_of? Post
        "#{comment.user.name} posted a new comment on #{comment.commentable.title}"
      end
    end
  end
end
