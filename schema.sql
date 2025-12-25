drop database DBProject_itr2;
create database DBProject_itr2;
use DBProject_itr2;

Create Table Account(
	account_id int primary key auto_increment,
    username varchar(20) unique,
    password varchar(16),
    role enum ('User', 'Admin')
);

Create Table User(
	user_id int primary key auto_increment,
	account_id int not null,
    first_name varchar(20) not null,
    last_name varchar(20) not null,
    email varchar(40) unique,
	foreign key (account_id) references Account(account_id) on update cascade on delete cascade
);

Create Table Admin(
	admin_id int primary key auto_increment,
	account_id int not null,
    email varchar(40) unique,
    foreign key (account_id) references Account(account_id) on update cascade on delete cascade
);

Create Table Genre(
	genre_id int primary key auto_increment,
    genre_name varchar(20)
);

Create Table UserFavGenre(
	user_id int,
    genre_id int,
    primary key (user_id, genre_id),
    foreign key (user_id) references User(user_id) on update cascade on delete cascade,
	foreign key (genre_id) references Genre(genre_id) on update cascade on delete cascade
);

Create Table Notification(
	notification_id int primary key auto_increment,
    notification_type varchar(20) not null,
    content Text not null,
    recipient_account_id int not null,
    recipient_type enum('User', 'Admin') not null,
    creation_datetime timestamp default (current_timestamp()) not null,
    expiry_datetime timestamp,
    read_status boolean default false,
    foreign key (recipient_account_id) references Account(account_id) on update cascade on delete cascade
);

Create Table Message(
	message_id int primary key auto_increment,
	sender_id int not null,
    receiver_id int not null,
    content text not null,
    message_datetime timestamp default (current_timestamp()) not null,
    read_status boolean default false,
    foreign key (sender_id) references User(user_id) on update cascade on delete cascade,
    foreign key (receiver_id) references User(user_id) on update cascade on delete cascade
);

Create Table Movie(
	movie_id int primary key auto_increment,
    title varchar(40) not null,
    synopsis text,
    release_year int,
    poster varchar(100)
);

Create Table MovieGenre(
	movie_id int,
    genre_id int,
    primary key (movie_id, genre_id),
    foreign key (movie_id) references Movie(movie_id) on update cascade on delete cascade,
    foreign key (genre_id) references Genre(genre_id) on update cascade on delete cascade
);

Create Table Post(
	post_id int primary key auto_increment,
    user_id int not null,
    movie_id int not null,
    content text not null,
    post_datetime timestamp default (current_timestamp()) not null,
    foreign key (user_id) references User(user_id) on update cascade on delete cascade,
    foreign key (movie_id) references Movie(movie_id) on update cascade on delete cascade
);

Create Table Comment(
	comment_id int primary key auto_increment,
    post_id int not null,
    user_id int not null,
    content text not null,
    comment_datetime timestamp default (current_timestamp()) not null,
    foreign key (user_id) references User(user_id) on update cascade on delete cascade,
    foreign key (post_id) references Post(post_id) on update cascade on delete cascade
);

Create Table Friendship(
	sender_id int not null,
    receiver_id int not null,
    status enum ('Accepted', 'Declined', 'Pending'),
    friendship_datetime timestamp not null,
    primary key (sender_id, receiver_id),
    foreign key (sender_id) references User(user_id) on update cascade on delete cascade,
    foreign key (receiver_id) references User(user_id) on update cascade on delete cascade
);

Create Table PostLike(
	user_id int not null,
    post_id int not null,
    like_datetime timestamp default (current_timestamp()) not null,
    primary key (user_id, post_id),
    foreign key (user_id) references User(user_id) on update cascade on delete cascade,
    foreign key (post_id) references Post(post_id) on update cascade on delete cascade
);

Create Table Watchlist(
	user_id int not null,
    movie_id int not null,
    watch_status enum('Watching', 'To-Watch', 'Completed') not null,
    last_update timestamp default (current_timestamp()) not null,
    primary key (user_id, movie_id),
    foreign key (user_id) references User(user_id) on update cascade on delete cascade,
    foreign key (movie_id) references Movie(movie_id) on update cascade on delete cascade
);

Create Table History(
	user_id int not null,
    movie_id int not null, 
    watched_date timestamp default (current_timestamp()) not null,
    primary key (user_id, movie_id),
    foreign key (user_id) references User(user_id) on update cascade on delete cascade,
    foreign key (movie_id) references Movie(movie_id) on update cascade on delete cascade
);

Create Table Review(
	review_id int primary key auto_increment,
    user_id int not null,
    movie_id int not null,
    rating int check (rating between 1 and 10),
    review_text text,
    review_datetime timestamp default (current_timestamp()) not null,
    unique (user_id, movie_id),
    foreign key (user_id) references User(user_id) on update cascade on delete cascade,
    foreign key (movie_id) references Movie(movie_id) on update cascade on delete cascade
);

Create Table Event(
	event_id int primary key auto_increment,
    title varchar(50) not null,
    movie_id int not null,
    host_id int not null,
    description text,
    event_datetime timestamp not null,
    capacity int check (capacity > 0),
    creation_datetime timestamp default (current_timestamp()) not null,
    unique(host_id, event_datetime),
    foreign key (movie_id) references Movie(movie_id) on update cascade on delete cascade,
    foreign key (host_id) references User(user_id) on update cascade on delete cascade
);

Create Table EventParticipation(
	event_id int not null,
    participant_id int not null,
    primary key (event_id, participant_id),
    foreign key (event_id) references Event(event_id) on update cascade on delete cascade,
    foreign key (participant_id) references User(user_id) on update cascade on delete cascade
);

Create Table RestrictedWord(
	word_id int primary key auto_increment,
    word varchar(20) unique not null,
    admin_id int not null,
    FOREIGN KEY (admin_id) REFERENCES Account(account_id) ON UPDATE CASCADE ON DELETE CASCADE
);

Create Table AuditLog(
	log_id int primary key auto_increment,
    admin_id int not null,
    action varchar(100) not null,
    target_table varchar(50) not null,
    FOREIGN KEY (admin_id) REFERENCES Account(account_id) ON UPDATE CASCADE ON DELETE CASCADE
);

create table report (
    report_id int primary key auto_increment,
    report_type varchar(50),
    reason varchar(500),
    generation_date datetime default current_timestamp,
    status varchar(30),
    export_format varchar(50),
    admin_id int,
    FOREIGN KEY (admin_id) REFERENCES Account(account_id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE Flag (
    flag_id INT PRIMARY KEY AUTO_INCREMENT,
    content_type ENUM('Post', 'Comment', 'Review') NOT NULL, 
    content_id INT NOT NULL,  -- The ID of the Post, Comment, or Review
    reason VARCHAR(255) NOT NULL,
    reporter_id INT NOT NULL,
    status ENUM('Pending', 'Resolved', 'Removed') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_by INT,
    resolved_at TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES User(user_id) ON DELETE CASCADE,
    FOREIGN KEY (resolved_by) REFERENCES Account(account_id) ON DELETE SET NULL
);
ALTER TABLE Account ADD COLUMN creation_datetime TIMESTAMP DEFAULT CURRENT_TIMESTAMP;