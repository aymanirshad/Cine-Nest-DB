USE DBProject_itr2;

-- ==========================================
-- 1. CLEANUP (Truncate all tables to start fresh)
-- ==========================================
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE Notification;
TRUNCATE TABLE report;
TRUNCATE TABLE AuditLog;
TRUNCATE TABLE RestrictedWord;
TRUNCATE TABLE EventParticipation;
TRUNCATE TABLE Event;
TRUNCATE TABLE Review;
TRUNCATE TABLE History;
TRUNCATE TABLE Watchlist;
TRUNCATE TABLE PostLike;
TRUNCATE TABLE Friendship;
TRUNCATE TABLE Message;
TRUNCATE TABLE Comment;
TRUNCATE TABLE Post;
TRUNCATE TABLE MovieGenre;
TRUNCATE TABLE Movie;
TRUNCATE TABLE UserFavGenre;
TRUNCATE TABLE Genre;
TRUNCATE TABLE Admin;
TRUNCATE TABLE User;
TRUNCATE TABLE Account;
SET FOREIGN_KEY_CHECKS = 1;


-- ACCOUNTS (10 users + 1 admin)

INSERT INTO Account (username, password, role) VALUES
('ahmed_92',     'P@ssw0rd1', 'User'),
('movieGeek',    'GeekPass23', 'User'),
('maria_k',      'M@ria2024', 'User'),
('john_beta',    'JohnBeta12', 'User'),
('sara.rose',    'SaraR!se9', 'User'),
('noor_auth',    'NoorPass77', 'User'),
('tech_fan',     'TechFan88', 'User'),
('cinelover',    'CineL0ve!', 'User'),
('samuelM',      'SamM2024!', 'User'),
('lina_arts',    'LinaArt#1', 'User'),
('moderator_jane','ModJane!01','Admin');

-- ============================
-- USERS (10) — account_id 1..10
-- ============================
INSERT INTO User (account_id, first_name, last_name, email) VALUES
(1, 'Ahmed',   'Khan',     'ahmed.khan@example.com'),
(2, 'Bilal',   'Ansari',   'bilal.ansari@example.com'),
(3, 'Maria',   'Khan',     'maria.k@example.com'),
(4, 'John',    'Beta',     'john.beta@example.com'),
(5, 'Sara',    'Rose',     'sara.rose@example.com'),
(6, 'Noor',    'Aziz',     'noor.aziz@example.com'),
(7, 'Ali',     'Raza',     'ali.raza@example.com'),
(8, 'Zainab',  'Iqbal',    'zainab.iqbal@example.com'),
(9, 'Samuel',  'Morris',   'samuel.morris@example.com'),
(10,'Lina',    'Arturo',   'lina.arturo@example.com');


-- ADMIN (1) — account_id = 11

INSERT INTO Admin (account_id, email) VALUES
(11, 'jane@cinenest.com');


-- GENRES (10)

INSERT INTO Genre (genre_name) VALUES
('Action'),
('Drama'),
('Comedy'),
('Sci-Fi'),
('Romance'),
('Thriller'),
('Horror'),
('Documentary'),
('Fantasy'),
('Mystery');

-- ============================
-- USER FAVORITE GENRES (sample)
-- each user 1-3 fav genres
-- ============================
INSERT INTO UserFavGenre (user_id, genre_id) VALUES
(1, 4),  -- Ahmed: Sci-Fi
(1, 9),  -- Ahmed: Fantasy
(2, 1),  -- Bilal: Action
(3, 5),  -- Maria: Romance
(4, 2),  -- John: Drama
(5, 3),  -- Sara: Comedy
(6, 4),  -- Noor: Sci-Fi
(7, 1),  -- Ali: Action
(7, 6),  -- Ali: Thriller
(8, 10), -- Zainab: Mystery
(9, 2),  -- Samuel: Drama
(9, 8),  -- Samuel: Documentary
(10, 3), -- Lina: Comedy
(10, 5), -- Lina: Romance
(2, 9);  -- Bilal: Fantasy


-- MOVIES (10)

-- ==========================================
-- ==========================================================
-- 2. INSERT ORIGINAL 20 MOVIES (From previous step)

-- ==========================================================
INSERT INTO Movie (movie_id, title, synopsis, release_year, poster) VALUES
(1, 'Avengers: Endgame', 'After the devastating events of Infinity War, the universe is in ruins.', 2019, 'photos/mv-item1.jpg'),
(2, 'The Hangover', 'Three buddies wake up from a bachelor party in Las Vegas, with no memory of the previous night.', 2009, 'photos/mv-item2.jpg'),
(3, 'The Godfather', 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.', 1972, 'photos/mv-item3.jpg'),
(4, 'It', 'In the summer of 1989, a group of bullied kids band together to destroy a shape-shifting monster.', 2017, 'photos/mv-item4.jpg'),
(5, 'Interstellar', 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.', 2014, 'photos/mv-item5.jpg'),
(6, 'Mad Max: Fury Road', 'In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler in search for her homeland.', 2015, 'photos/mv-item6.jpg'),
(7, 'Superbad', 'Two co-dependent high school seniors are forced to deal with separation anxiety as their plan to stage a booze-soaked party goes awry.', 2007, 'photos/mv-item7.jpg'),
(8, 'Forrest Gump', 'The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man.', 1994, 'photos/mv-item8.jpg'),
(9, 'A Quiet Place', 'In a post-apocalyptic world, a family is forced to live in silence while hiding from monsters with ultra-sensitive hearing.', 2018, 'photos/mv-item9.jpg'),
(10, 'The Matrix', 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.', 1999, 'photos/mv-item10.jpg'),
(11, 'Inception', 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea.', 2010, 'photos/slider.jpg'),
(12, 'Joker', 'In Gotham City, mentally troubled comedian Arthur Fleck is disregarded and mistreated by society.', 2019, 'photos/mv-item12.jpg'),
(13, 'Parasite', 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.', 2019, 'photos/mv-item13.jpg'),
(14, 'The Lion King', 'After the murder of his father, a young lion prince flees his kingdom only to learn the true meaning of responsibility and bravery.', 2019, 'photos/mv-item14.jpg'),
(15, 'Frozen', 'When the newly crowned Queen Elsa accidentally uses her power to turn things into ice to curse her home in infinite winter.', 2013, 'photos/mv-item15.jfif'),
(16, 'Black Panther', 'T''Challa, heir to the hidden but advanced kingdom of Wakanda, must step forward to lead his people into a new future.', 2018, 'photos/mv-item16.jpg'),
(17, 'The Dark Knight', 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological tests.', 2008, 'photos/slider-bg3.jpg'),
(18, 'Coco', 'Aspiring musician Miguel, confronted with his family\'s ancestral ban on music, enters the Land of the Dead to find his great-great-grandfather.', 2017, 'photos/mv-item18.jfif'),
(19, 'Shutter Island', 'In 1954, a U.S. Marshal investigates the disappearance of a murderer who escaped from a hospital for the criminally insane.', 2010, 'photos/mv-item19.jpeg'),
(20, 'Guardians of the Galaxy', 'A group of intergalactic criminals must pull together to stop a fanatical warrior with plans to purge the universe.', 2014, 'photos/mv-item20.jpg'),
(21, 'Oppenheimer', 'The story of J. Robert Oppenheimer.', 2023, 'photos/slider-bg2.jpg');

INSERT INTO MovieGenre (movie_id, genre_id) VALUES
(1, 1), (2, 3), (3, 2), (4, 7), (5, 4), (6, 1), (7, 3), (8, 2), (9, 7), (10, 4),
(11, 4), (12, 2), (13, 6), (14, 9), (15, 9), (16, 1), (17, 1), (18, 9), (19, 6), (20, 1);

-- ==========================================================
-- 3. INSERT ACTION MOVIES (IDs 21-36)
-- Images: photos/a1.jpg to a16.jpg
-- ==========================================================
INSERT INTO Movie (title, synopsis, release_year, poster) VALUES
('Mission Impossible', 'Ethan Hunt and his IMF team race against time.', 2023, 'photos/a1.jpg'),
('John Wick 4', 'John Wick uncovers a path to defeating The High Table.', 2023, 'photos/a2.jpg'),
('Extraction 2', 'Tyler Rake is back for another deadly mission.', 2023, 'photos/a3.jpg'),
('The Equalizer 3', 'Robert McCall finds himself at home in Southern Italy.', 2023, 'photos/a4.jpg'),
('Fast X', 'Dom Toretto and his family act as targets.', 2023, 'photos/a5.jpg'),
('Bullet Train', 'Five assassins aboard a fast moving bullet train.', 2022, 'photos/a6.jpg'),
('Top Gun: Maverick', 'After thirty years, Maverick is still pushing the envelope.', 2022, 'photos/a7.jpg'),
('Nobody', 'A bystander intervenes to help a woman being harassed.', 2021, 'photos/a8.jpg'),
('Gray Man', 'The CIA most skilled operative uncovers dark secrets.', 2022, 'photos/a9.jpg'),
('Wrath of Man', 'A cold and mysterious new security guard.', 2021, 'photos/a10.jpg'),
('Tenet', 'Armed with only one word, Tenet.', 2020, 'photos/a11.jpg'),
('Gladiator', 'A former Roman General sets out to exact vengeance.', 2000, 'photos/a12.jpg'),
('Die Hard', 'An NYPD officer tries to save his wife.', 1988, 'photos/a13.jpg'),
('Terminator 2', 'A cyborg must protect John Connor.', 1991, 'photos/a14.jpg'),
('Taken', 'A retired CIA agent travels across Europe.', 2008, 'photos/a15.jpg'),
('Speed', 'A young police officer must prevent a bomb exploding.', 1994, 'photos/a16.jpg');

-- Link IDs 21-36 to ACTION (Genre ID 1)
INSERT INTO MovieGenre (movie_id, genre_id) 
SELECT movie_id, 1 FROM Movie WHERE movie_id BETWEEN 21 AND 36;

-- ==========================================================
-- 4. INSERT COMEDY MOVIES (IDs 37-59)
-- Images: photos/comedy1-3.jpg and c4-c23.jpg
-- ==========================================================
INSERT INTO Movie (title, synopsis, release_year, poster) VALUES
('Comedy Hit 1', 'A hilarious journey of two friends.', 2023, 'photos/comedy1.jpg'),
('Funny Movie', 'Everything goes wrong at the wedding.', 2022, 'photos/comedy2.jpg'),
('Classic Comedy', 'An old school laugh riot.', 1995, 'photos/comedy3.jpg'),
('Laugh Riot 4', 'A road trip gone wrong.', 2021, 'photos/c4.jpg'),
('Laugh Riot 5', 'Office antics spiral out of control.', 2020, 'photos/c5.jpg'),
('Laugh Riot 6', 'A family reunion to remember.', 2019, 'photos/c6.jpg'),
('Laugh Riot 7', 'College life adventures.', 2018, 'photos/c7.jpg'),
('Laugh Riot 8', 'Mistaken identity crisis.', 2017, 'photos/c8.jpg'),
('Laugh Riot 9', 'Holiday chaos ensued.', 2016, 'photos/c9.jpg'),
('Laugh Riot 10', 'Neighbors at war.', 2015, 'photos/c10.jpg'),
('Laugh Riot 11', 'The unexpected roommate.', 2014, 'photos/c11.jpg'),
('Laugh Riot 12', 'Winning the lottery.', 2013, 'photos/c12.jpg'),
('Laugh Riot 13', 'High school reunion.', 2012, 'photos/c13.jpg'),
('Laugh Riot 14', 'The backup plan.', 2011, 'photos/c14.jpg'),
('Laugh Riot 15', 'Wedding crashers return.', 2010, 'photos/c15.jpg'),
('Laugh Riot 16', 'Summer camp memories.', 2009, 'photos/c16.jpg'),
('Laugh Riot 17', 'The big promotion.', 2008, 'photos/c17.jpg'),
('Laugh Riot 18', 'Weekend getaway.', 2007, 'photos/c18.jpg'),
('Laugh Riot 19', 'Pet detective work.', 2006, 'photos/c19.jpg'),
('Laugh Riot 20', 'Cooking contest disaster.', 2005, 'photos/c20.jpg'),
('Laugh Riot 21', 'Fashion week fails.', 2004, 'photos/c21.jpg'),
('Laugh Riot 22', 'The accidental spy.', 2003, 'photos/c22.jpg'),
('Laugh Riot 23', 'Parental guidance needed.', 2002, 'photos/c23.jpg');

-- Link IDs 37-59 to COMEDY (Genre ID 3)
INSERT INTO MovieGenre (movie_id, genre_id) 
SELECT movie_id, 3 FROM Movie WHERE movie_id BETWEEN 37 AND 59;

-- ==========================================================
-- 5. INSERT HORROR MOVIES (IDs 60-68)
-- Images: photos/h1.jpg to h9.jpg
-- ==========================================================
INSERT INTO Movie (title, synopsis, release_year, poster) VALUES
('Scary Movie 1', 'Something is in the attic.', 2023, 'photos/h1.jpg'),
('Night Terror', 'Sleep is not an option.', 2022, 'photos/h2.jpg'),
('Classic Horror', 'The original scream.', 1980, 'photos/h3.jpg'),
('Dark Shadow', 'Shadows move on their own.', 2021, 'photos/h4.jpg'),
('The Creep', 'He watches from the woods.', 2020, 'photos/h5.jpg'),
('Ghost House', 'Do not enter the basement.', 2019, 'photos/h6.jpg'),
('Possession', 'An ancient spirit returns.', 2018, 'photos/h7.jpg'),
('The Doll', 'It never blinks.', 2017, 'photos/h8.jpg'),
('Lake Fear', 'The water is not safe.', 2016, 'photos/h9.jpg');

-- Link IDs 60-68 to HORROR (Genre ID 7)
INSERT INTO MovieGenre (movie_id, genre_id) 
SELECT movie_id, 7 FROM Movie WHERE movie_id BETWEEN 60 AND 68;

-- ==========================================================
-- 6. INSERT ROMANCE MOVIES (IDs 69-85)
-- Images: photos/r1.jpg to r17.jpg
-- ==========================================================
INSERT INTO Movie (title, synopsis, release_year, poster) VALUES
('Love Story 1', 'A summer to remember.', 2023, 'photos/r1.jpg'),
('Romantic Tale', 'Letters from the past.', 2022, 'photos/r2.jpg'),
('Classic Romance', 'Love against all odds.', 1990, 'photos/r3.jpg'),
('Eternal Love', 'Soulmates find each other.', 2021, 'photos/r4.jpg'),
('Paris Dreams', 'Romance in the city of lights.', 2020, 'photos/r5.jpg'),
('Sunset Kiss', 'Meeting at the pier.', 2019, 'photos/r6.jpg'),
('Wedding Bells', 'Always the bridesmaid.', 2018, 'photos/r7.jpg'),
('Secret Admire', 'Notes in the locker.', 2017, 'photos/r8.jpg'),
('First Date', 'Nervous beginnings.', 2016, 'photos/r9.jpg'),
('True Heart', 'Listen to your heart.', 2015, 'photos/r10.jpg'),
('Forever Yours', 'A promise kept.', 2014, 'photos/r11.jpg'),
('Winter Love', 'Warmth in the snow.', 2013, 'photos/r12.jpg'),
('Spring Fling', 'Blossoming feelings.', 2012, 'photos/r13.jpg'),
('Summer Love', 'Beach days and nights.', 2011, 'photos/r14.jpg'),
('Autumn Fall', 'Falling in love.', 2010, 'photos/r15.jpg'),
('Destiny', 'Written in the stars.', 2009, 'photos/r16.jpg'),
('Cupid Arrow', 'Struck by love.', 2008, 'photos/r17.jpg');

-- Link IDs 69-85 to ROMANCE (Genre ID 5)
INSERT INTO MovieGenre (movie_id, genre_id) 
SELECT movie_id, 5 FROM Movie WHERE movie_id BETWEEN 69 AND 85;

-- ==========================================================
-- 7. INSERT SCI-FI MOVIES (IDs 86-94)
-- Images: photos/s1.jpg to s9.jpg
-- ==========================================================
INSERT INTO Movie (title, synopsis, release_year, poster) VALUES
('Galactic Wars', 'Battle for the galaxy.', 2023, 'photos/s1.jpg'),
('Space Journey', 'To the edge of the universe.', 2022, 'photos/s2.jpg'),
('Retro Sci-Fi', 'Robots take over.', 1985, 'photos/s3.jpg'),
('Future World', 'AI gains consciousness.', 2021, 'photos/s4.jpg'),
('Cyber City', 'Neon lights and hackers.', 2020, 'photos/s5.jpg'),
('Alien Contact', 'They come in peace?', 2019, 'photos/s6.jpg'),
('Time Paradox', 'Changing the past.', 2018, 'photos/s7.jpg'),
('Clone Wars', 'Army of duplicates.', 2017, 'photos/s8.jpg'),
('Star Ship', 'The last voyage.', 2016, 'photos/s9.jpg');

-- Link IDs 86-94 to SCI-FI (Genre ID 4)
INSERT INTO MovieGenre (movie_id, genre_id) 
SELECT movie_id, 4 FROM Movie WHERE movie_id BETWEEN 86 AND 94;

-- ==========================================================
-- 8. ADD REVIEWS (To ensure ratings appear)
-- ==========================================================
INSERT INTO Review (user_id, movie_id, rating, review_text) 
SELECT 1, movie_id, FLOOR(7 + (RAND() * 3)), 'Great movie!' 
FROM Movie WHERE movie_id > 20;
-- POSTS (15) — user posts about movies

INSERT INTO Post (user_id, movie_id, content, post_datetime) VALUES
(1, 1, 'This film''s visuals are stunning — a must-watch for sci-fi fans.', '2025-02-05 19:22:00'),
(2, 3, 'Nightfall City had me on the edge of my seat the whole time.', '2025-01-18 21:10:00'),
(3, 2, 'A touching family story, beautiful performances.', '2024-11-04 14:05:00'),
(4, 6, 'Shadows of Time is confusing but rewarding — discuss theories?', '2025-03-02 09:12:00'),
(5, 7, 'Laughing River made my day — such warmth and humor.', '2024-12-21 18:00:00'),
(6,10, 'Whispering Woods has gorgeous worldbuilding.', '2025-06-10 11:30:00'),
(7, 3, 'Rewatched Nightfall City with friends — still great action.', '2024-10-09 20:44:00'),
(8, 9, 'Hidden Truths is an important documentary.', '2025-04-15 13:05:00'),
(9, 4, 'Echoes of Eternity left me thinking about mortality.', '2024-09-01 16:20:00'),
(10,1, 'The Silent Horizon soundtrack is hauntingly beautiful.', '2025-08-04 12:10:00'),
(2,10, 'Whispering Woods is visually charming, recommended for all ages.', '2025-05-28 10:00:00'),
(3,5, 'The Broken Sky had some of the best aerial sequences.', '2024-07-22 09:45:00'),
(1,8, 'Midnight Terrors is not for the faint-hearted.', '2024-10-31 23:50:00'),
(4,7, 'Laughing River deserves more attention.', '2025-02-14 17:00:00'),
(5,9, 'Hidden Truths made me look up the background story.', '2024-08-12 15:20:00');

-- ============================
-- COMMENTS (25) — responses to posts
-- ============================
INSERT INTO Comment (post_id, user_id, content, comment_datetime) VALUES
(1, 2, 'Absolutely — the cinematography is next-level.', '2025-02-05 20:01:00'),
(1, 8, 'Loved the color palettes in several scenes.', '2025-02-05 20:14:00'),
(2, 1, 'Which scene did you like the most?', '2025-01-18 21:30:00'),
(3, 5, 'I cried at the third act too.', '2024-11-05 07:22:00'),
(4, 6, 'I have a theory about the timeline jumps.', '2025-03-02 10:00:00'),
(5, 9, 'One of my favorite comedies of the year.', '2024-12-22 08:10:00'),
(6, 10, 'The heroine''s arc is beautifully handled.', '2025-06-10 12:05:00'),
(7, 3, 'Action sequences are choreographed so well.', '2024-10-10 09:50:00'),
(8, 2, 'Important watch for anyone who follows the issue.', '2025-04-16 08:00:00'),
(9, 1, 'I agree — it lingered with me for days.', '2024-09-02 11:10:00'),
(10,4, 'Soundtrack deserves a separate award.', '2025-08-04 13:00:00'),
(11,7, 'Family-friendly and beautiful.', '2025-05-28 11:12:00'),
(12,2, 'Those aerial shots were incredible.', '2024-07-22 10:02:00'),
(13,5, 'Halloween special screening was intense.', '2024-11-01 00:05:00'),
(14,8, 'Agree — more people should see it.', '2025-02-15 09:00:00'),
(15,6, 'The research behind Hidden Truths is thorough.', '2024-08-13 10:40:00'),
(2,9, 'I liked the twist at the end.', '2025-01-19 10:10:00'),
(4,3, 'Tell your theory — I''m curious!', '2025-03-02 10:05:00'),
(5,7, 'Best small-town comedy I''ve seen.', '2024-12-23 12:00:00'),
(6,1, 'The worldbuilding reminded me of classic fantasies.', '2025-06-10 12:45:00'),
(7,2, 'We need a sequel!', '2024-10-11 07:30:00'),
(8,10,'Documentary prompts important questions.', '2025-04-16 08:25:00'),
(9,4, 'That scene broke me emotionally.', '2024-09-02 12:00:00'),
(10,3,'Sound design was superb.', '2025-08-04 14:00:00'),
(3,6, 'I loved the character work.', '2024-11-05 07:50:00');


-- MESSAGES (20) — user-to-user
-- sender_id and receiver_id reference User(user_id)

INSERT INTO Message (sender_id, receiver_id, content, message_datetime, read_status) VALUES
(1, 2, 'Hey — did you catch Nightfall City last night?', '2025-01-19 09:00:00', true),
(2, 1, 'Yes! Loved the stunt choreography.', '2025-01-19 09:05:00', true),
(3, 5, 'Want to join the weekend watch party?', '2024-11-10 12:30:00', false),
(5, 3, 'Count me in — what time?', '2024-11-10 12:35:00', false),
(4, 7, 'Have you seen the new thriller?', '2025-03-03 08:00:00', true),
(7, 4, 'Yes — great pacing.', '2025-03-03 08:20:00', true),
(6, 10,'Would you like to collaborate on the fan project?', '2025-06-11 09:00:00', false),
(10,6, 'Sounds fun! Send details.', '2025-06-11 09:10:00', false),
(8, 9, 'Have you read the documentary notes?', '2025-04-16 09:00:00', true),
(9, 8, 'Yes — very informative.', '2025-04-16 09:12:00', true),
(2, 3, 'Congrats on the write-up!', '2024-11-06 10:00:00', true),
(3, 2, 'Thanks — appreciate it.', '2024-11-06 10:05:00', true),
(1,10, 'Would you review my short list?', '2025-08-05 07:00:00', false),
(10,1, 'Sure — send it over.', '2025-08-05 07:05:00', false),
(5, 9, 'Hidden Truths screening tomorrow?', '2024-08-14 09:30:00', true),
(9, 5, 'I''ll be there.', '2024-08-14 09:45:00', true),
(4, 1, 'Do you have tickets for Laughing River?', '2025-02-14 12:00:00', false),
(1, 4, 'Yes — two seats left.', '2025-02-14 12:01:00', false),
(6, 2, 'I have early access codes.', '2025-06-01 10:00:00', true),
(2, 6, 'Thanks, sending now.', '2025-06-01 10:05:00', true);

-- FRIENDSHIPS (12)
-- mixture of Accepted, Pending, Declined

INSERT INTO Friendship (sender_id, receiver_id, status, friendship_datetime) VALUES
(1, 2, 'Accepted', '2024-05-10 09:00:00'),
(2, 3, 'Accepted', '2024-06-01 10:15:00'),
(3, 5, 'Accepted', '2024-06-12 11:20:00'),
(4, 7, 'Pending',  '2025-01-05 14:40:00'),
(5, 1, 'Accepted', '2024-08-03 18:05:00'),
(6, 9, 'Accepted', '2024-09-10 08:00:00'),
(7, 8, 'Accepted', '2024-10-02 07:30:00'),
(8, 9, 'Pending',  '2025-03-20 17:00:00'),
(9,10, 'Accepted', '2024-12-25 12:00:00'),
(10,4,'Declined', '2025-02-20 09:00:00'),
(2, 7, 'Accepted', '2024-11-03 15:10:00'),
(3, 4, 'Accepted', '2024-07-14 13:00:00');

-- ============================
-- POSTLIKES (25)
-- ============================
INSERT INTO PostLike (user_id, post_id, like_datetime) VALUES
(2,1,'2025-02-05 20:02:00'),
(3,1,'2025-02-05 20:15:00'),
(4,2,'2025-01-18 21:20:00'),
(1,2,'2025-01-18 21:31:00'),
(5,3,'2024-11-05 07:25:00'),
(9,6,'2025-06-10 12:10:00'),
(8,1,'2025-02-05 20:16:00'),
(7,2,'2025-01-18 21:40:00'),
(2,4,'2025-03-02 10:20:00'),
(3,4,'2025-03-02 10:22:00'),
(4,5,'2024-12-22 09:00:00'),
(6,10,'2025-08-04 13:05:00'),
(10,11,'2025-05-28 11:15:00'),
(2,11,'2025-05-28 11:20:00'),
(1,13,'2024-11-01 00:10:00'),
(5,14,'2025-02-14 17:10:00'),
(8,9,'2025-04-16 08:30:00'),
(3,12,'2024-07-22 10:10:00'),
(9,3,'2024-11-05 08:00:00'),
(7,7,'2024-10-10 10:00:00'),
(1,4,'2025-03-02 10:30:00'),
(2,6,'2025-06-10 12:20:00'),
(6,2,'2025-01-19 09:20:00'),
(4,9,'2024-09-02 11:30:00'),
(10,15,'2024-08-13 11:00:00');

-- ============================
-- WATCHLIST (20) — each user 2 movies on watchlist
-- ============================
INSERT INTO Watchlist (user_id, movie_id, watch_status, last_update) VALUES
(1, 2, 'To-Watch', '2025-01-01 08:00:00'),
(1, 3, 'Watching', '2025-01-20 20:00:00'),
(2, 1, 'Completed', '2025-02-06 10:00:00'),
(2,10, 'To-Watch', '2025-05-20 09:00:00'),
(3, 5, 'Completed', '2024-07-23 18:00:00'),
(3, 2, 'To-Watch', '2024-11-01 09:00:00'),
(4, 3, 'Watching', '2025-01-18 21:00:00'),
(4, 7, 'To-Watch', '2025-02-10 12:00:00'),
(5, 9, 'Completed', '2024-08-14 10:00:00'),
(5, 1, 'To-Watch', '2025-02-01 09:00:00'),
(6,10, 'Watching', '2025-06-10 11:45:00'),
(6, 4, 'To-Watch', '2024-09-10 09:00:00'),
(7, 3, 'Completed', '2024-10-12 20:00:00'),
(7, 1, 'To-Watch', '2025-03-01 08:00:00'),
(8, 9, 'Watching', '2025-04-15 13:30:00'),
(8, 2, 'To-Watch', '2025-01-05 10:00:00'),
(9, 4, 'Completed', '2024-09-03 10:00:00'),
(9, 6, 'To-Watch', '2025-03-05 09:00:00'),
(10,7, 'Watching', '2025-02-14 17:30:00'),
(10,5, 'To-Watch', '2024-07-25 11:00:00');


-- HISTORY (10) — sample watched records

INSERT INTO History (user_id, movie_id, watched_date) VALUES
(1, 2, '2025-01-02 20:30:00'),
(2, 1, '2025-02-06 21:00:00'),
(3, 5, '2024-07-23 19:40:00'),
(4, 3, '2024-10-09 21:15:00'),
(5, 9, '2024-08-14 10:30:00'),
(6,10, '2025-06-10 12:00:00'),
(7, 3, '2024-10-12 20:10:00'),
(8, 9, '2025-04-15 14:00:00'),
(9, 4, '2024-09-02 16:00:00'),
(10,1, '2025-08-04 12:30:00');



-- EVENTS (5)
-- unique constraint on (host_id, event_datetime) held

INSERT INTO Event (title, movie_id, host_id, description, event_datetime, capacity, creation_datetime) VALUES
('Silent Horizon Screening', 1, 2, 'Community screening with discussion.', '2025-03-15 19:00:00', 60, '2025-02-10 10:00:00'),
('Nightfall City Marathon', 3, 7, 'Back-to-back action films screening.', '2025-04-12 18:00:00', 120, '2025-03-01 09:00:00'),
('Echoes Q&A', 4, 9, 'Q&A with film researchers.', '2024-11-30 17:30:00', 80, '2024-11-01 12:00:00'),
('Hidden Truths Panel', 9, 5, 'Panel discussion with investigators.', '2025-05-02 15:00:00', 100, '2025-04-01 14:00:00'),
('Whispering Woods Family Matinee', 10, 6, 'Family friendly showing and activities.', '2025-06-20 11:00:00', 200, '2025-05-18 08:30:00');

-- EVENT PARTICIPATION (20)

INSERT INTO EventParticipation (event_id, participant_id) VALUES
(1,1),(1,2),(1,5),(1,8),(1,10),
(2,3),(2,7),(2,1),(2,4),(2,9),
(3,9),(3,2),(3,6),
(4,5),(4,8),(4,3),(4,1),
(5,6),(5,10),(5,7);


-- RESTRICTED WORDS (10) — reference Admin.admin_id = 1

INSERT INTO RestrictedWord (word, admin_id) VALUES
('spoiler', 1),
('hate', 1),
('stupid', 1),
('idiot', 1),
('terror', 1),
('racist', 1),
('leak', 1),
('swear', 1),
('harass', 1),
('spoilt', 1);

-- ============================
-- AUDIT LOG (10) — admin actions
-- ============================
INSERT INTO AuditLog (admin_id, action, target_table) VALUES
(1, 'Added restricted word: spoiler', 'RestrictedWord'),
(1, 'Removed restricted word: leak', 'RestrictedWord'),
(1, 'Banned user: john_beta', 'User'),
(1, 'Unbanned user: maria_k', 'User'),
(1, 'Deleted post id 12', 'Post'),
(1, 'Exported report: most_watched', 'report'),
(1, 'Added genre: Mystery', 'Genre'),
(1, 'Updated movie metadata: Echoes of Eternity', 'Movie'),
(1, 'Created event: Whispering Woods Family Matinee', 'Event'),
(1, 'Reviewed flagged item id 23', 'Post');


-- REPORTS (10) — admin-generated reports

INSERT INTO report (report_type, reason, generation_date, status, export_format, admin_id) VALUES
('Most Watched','Monthly top completions','2025-08-01 10:00:00','Completed','CSV',1),
('Highest Rated','Quarterly highest average rating','2025-07-01 11:30:00','Completed','PDF',1),
('Active Users','Monthly active users summary','2025-08-02 09:20:00','Completed','CSV',1),
('Forums','Top forum activity','2025-06-05 14:00:00','Completed','PDF',1),
('Custom','Requested by admin','2025-05-10 08:00:00','Completed','XLSX',1),
('Most Watched','Weekly snapshot','2025-08-08 07:00:00','Completed','CSV',1),
('Highest Rated','Yearly top films','2025-01-02 09:00:00','Completed','PDF',1),
('Active Users','User retention report','2025-04-01 10:40:00','Completed','CSV',1),
('Forums','Forum trends 2024-25','2025-05-20 13:00:00','Completed','PDF',1),
('Custom','Ad-hoc export','2025-08-10 16:10:00','Completed','CSV',1);

select * from movie;

-- NOTIFICATIONS (sample, recipient_account_id references Account.account_id)
-- include some admin notifications and user notifications

INSERT INTO Notification (notification_type, content, recipient_account_id, recipient_type, creation_datetime, expiry_datetime, read_status) VALUES
('System','Your account was marked active', 1, 'User', '2025-02-01 08:00:00', '2026-02-01 08:00:00', false),
('Moderation','Your post has been flagged for review', 3, 'User', '2025-02-06 09:00:00', '2025-03-06 09:00:00', false),
('Event','Reminder: Silent Horizon Screening tomorrow', 2, 'User', '2025-03-14 09:00:00', '2025-03-16 09:00:00', false),
('Admin','New report exported: Most Watched', 11, 'Admin', '2025-08-01 10:05:00', NULL, true),
('System','Password change recommended', 4, 'User', '2025-01-10 06:00:00', NULL, false),
('Event','Whispering Woods family event updated', 11, 'Admin', '2025-05-18 09:00:00', NULL, false),
('Message','You have a new message from bilal', 2, 'User', '2025-01-19 09:01:00', NULL, true),
('Moderation','Restricted word added: spoiler', 11, 'Admin', '2025-02-10 10:05:00', NULL, true),
('System','New features rolled out', 5, 'User', '2025-04-01 12:00:00', NULL, false),
('Event','Echoes Q&A tickets available', 9, 'User', '2024-11-10 08:00:00', '2024-11-30 00:00:00', true);