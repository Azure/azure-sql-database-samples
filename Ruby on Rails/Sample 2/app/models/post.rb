class Post < ActiveRecord::Base
	belongs_to:user

	validates:content, length: { maximum: 140}

	validates:user, presence: { :message => "ID does not exist."}

end
