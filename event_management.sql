-- MySQL dump 10.13  Distrib 8.0.27, for macos11 (x86_64)
--
-- Host: localhost    Database: event_management
-- ------------------------------------------------------
-- Server version	8.0.27

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `event_id` int NOT NULL,
  `guest_count` int DEFAULT '50',
  `budget` decimal(10,2) DEFAULT NULL,
  `status` enum('pending','confirmed','cancelled','completed') DEFAULT 'pending',
  `services` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_event` (`event_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,1,1,100,7500.00,'confirmed','{\"music\": true, \"catering\": true, \"decoration\": true}','2026-01-09 15:02:13'),(2,1,3,50,2500.00,'pending','{\"decoration\": true, \"photography\": true}','2026-01-09 15:02:13'),(3,1,5,30,3000.00,'confirmed','{\"catering\": true, \"team_activities\": true}','2026-01-09 15:02:13'),(4,2,1,100,3900.00,'confirmed','[1, 3, 5]','2026-01-09 17:47:46'),(5,2,3,30,2300.00,'pending','[2, 4]','2026-01-09 17:47:46'),(6,3,2,50,4500.00,'confirmed','[6, 8]','2026-01-09 17:47:46'),(7,14,1,2,500.00,'confirmed',NULL,'2026-01-13 04:19:42'),(8,14,9,1,800.00,'pending','[]','2026-01-13 05:44:06');
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `description` text,
  `type` varchar(50) DEFAULT NULL,
  `date` date NOT NULL,
  `time` time DEFAULT NULL,
  `location` varchar(255) NOT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `capacity` int DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `organizer_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `organizer_id` (`organizer_id`),
  KEY `idx_date` (`date`),
  KEY `idx_type` (`type`),
  KEY `idx_location` (`location`(100)),
  CONSTRAINT `events_ibfk_1` FOREIGN KEY (`organizer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events`
--

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
INSERT INTO `events` VALUES (1,'Summer Music Festival','Annual summer music festival with multiple artists and food stalls','concert','2024-06-15',NULL,'Central Park, New York',75.00,NULL,NULL,2,'2026-01-09 15:02:13'),(2,'Tech Conference 2024','Latest innovations in technology with expert speakers','conference','2024-07-20',NULL,'Convention Center, San Francisco',299.99,NULL,NULL,2,'2026-01-09 15:02:13'),(3,'Wedding Expo','Bridal show featuring top wedding planners and vendors','wedding','2024-05-10',NULL,'Grand Hotel, Los Angeles',25.00,NULL,NULL,2,'2026-01-09 15:02:13'),(4,'Charity Gala Dinner','Elegant fundraising event for children education','gala','2024-08-05',NULL,'Ritz Carlton, Chicago',150.00,NULL,NULL,2,'2026-01-09 15:02:13'),(5,'Corporate Team Building','Team building activities and workshops for companies','corporate','2024-09-12',NULL,'Office Complex, Austin',99.99,NULL,NULL,2,'2026-01-09 15:02:13'),(6,'Birthday Party Planning Workshop','Learn to organize perfect birthday parties','birthday','2024-06-30',NULL,'Venue Hall, Miami',199.99,NULL,NULL,2,'2026-01-09 15:02:13'),(7,'Summer Wedding Expo','Beautiful outdoor summer wedding showcase with floral arrangements and professional photography. Perfect for couples planning their dream wedding.','wedding','2024-06-15','14:00:00','Grand Hotel Garden, New York',2500.00,200,'https://images.unsplash.com/photo-1519741497674-611481863552',NULL,'2026-01-09 17:46:34'),(8,'Corporate Annual Meet','Networking and year-end celebration for corporate professionals. Includes keynote speeches and workshops.','corporate','2024-05-20','18:00:00','Convention Center, Chicago',1800.00,150,'https://images.unsplash.com/photo-1542744173-8e7e51315f50',NULL,'2026-01-09 17:46:34'),(9,'Kids Birthday Special','Fun-filled birthday party for kids with games, entertainment, and magical decorations.','birthday','2024-04-10','12:00:00','Party Palace, Miami',800.00,50,'https://images.unsplash.com/photo-1530103862676-de8c9debad1d',NULL,'2026-01-09 17:46:34'),(10,'Music Festival 2024','Annual music festival featuring multiple artists across genres. Food stalls and great atmosphere.','concert','2024-07-22','16:00:00','City Stadium, Los Angeles',3500.00,5000,'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',NULL,'2026-01-09 17:46:34'),(11,'Tech Conference','Latest technology trends and networking event for IT professionals.','conference','2024-08-05','09:00:00','Tech Hub Auditorium, San Francisco',1200.00,300,'https://images.unsplash.com/photo-1542744173-8e7e51315f50',NULL,'2026-01-09 17:46:34'),(12,'Charity Gala Dinner','Elegant charity event to raise funds for local community projects.','other','2024-09-30','19:00:00','Royal Ballroom, Boston',1500.00,100,'https://images.unsplash.com/photo-1511795409834-69f9d8d29c59',NULL,'2026-01-09 17:46:34');
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gallery`
--

DROP TABLE IF EXISTS `gallery`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `gallery` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_type` varchar(50) NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `title` varchar(200) DEFAULT NULL,
  `description` text,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_event_type` (`event_type`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gallery`
--

LOCK TABLES `gallery` WRITE;
/*!40000 ALTER TABLE `gallery` DISABLE KEYS */;
INSERT INTO `gallery` VALUES (1,'wedding','https://images.unsplash.com/photo-1519225421980-715cb0215aed','Elegant Wedding Setup','Beautiful outdoor wedding ceremony decoration','2026-01-09 15:02:13'),(2,'corporate','https://images.unsplash.com/photo-1542744173-8e7e53415bb0','Business Conference','Corporate event with professional speakers','2026-01-09 15:02:13'),(3,'birthday','https://images.unsplash.com/photo-1530103862676-de8c9debad1d','Birthday Celebration','Colorful birthday party decorations','2026-01-09 15:02:13'),(4,'conference','https://images.unsplash.com/photo-1540575467063-178a50c2df87','Tech Summit Setup','Modern technology conference stage','2026-01-09 15:02:13'),(5,'concert','https://images.unsplash.com/photo-1501281667305-0d4ebd5b1b08','Music Festival Stage','Large concert stage setup','2026-01-09 15:02:13'),(6,'gala','https://images.unsplash.com/photo-1511795409834-ef04bbd61622','Gala Dinner','Elegant dinner event setup','2026-01-09 15:02:13');
/*!40000 ALTER TABLE `gallery` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `booking_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `payment_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('success','failed','pending') DEFAULT 'pending',
  PRIMARY KEY (`id`),
  KEY `booking_id` (`booking_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `services` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `category` enum('decoration','catering','photography','music','venue') NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES `services` WRITE;
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
INSERT INTO `services` VALUES (1,'Basic Decoration','Basic floral and lighting decoration',500.00,'decoration'),(2,'Premium Decoration','Luxury decoration with theme setup',1200.00,'decoration'),(3,'Buffet Service','Standard buffet for 50 people',800.00,'catering'),(4,'Sit-down Dinner','Formal dining service',1500.00,'catering'),(5,'Photography Basic','4 hours coverage with 100 edited photos',600.00,'photography'),(6,'Videography Package','Video coverage with highlight film',1000.00,'photography'),(7,'DJ Service','DJ with basic sound system',400.00,'music'),(8,'Live Band','3-piece live band performance',1200.00,'music'),(9,'Basic Decoration','Basic floral and lighting decoration',500.00,'decoration'),(10,'Premium Decoration','Luxury decoration with theme setup',1200.00,'decoration'),(11,'Buffet Service','Standard buffet for 50 people',800.00,'catering'),(12,'Sit-down Dinner','Formal dining service',1500.00,'catering'),(13,'Photography Basic','4 hours coverage with 100 edited photos',600.00,'photography'),(14,'Videography Package','Video coverage with highlight film',1000.00,'photography'),(15,'DJ Service','DJ with basic sound system',400.00,'music'),(16,'Live Band','3-piece live band performance',1200.00,'music'),(17,'Basic Decoration','Basic floral and lighting decoration for any event',500.00,'decoration'),(18,'Premium Decoration','Luxury decoration with theme setup and custom designs',1200.00,'decoration'),(19,'Buffet Service','Standard buffet service for up to 50 people',800.00,'catering'),(20,'Sit-down Dinner','Formal dining service with wait staff',1500.00,'catering'),(21,'Photography Basic','4 hours coverage with 100 edited photos',600.00,'photography'),(22,'Videography Package','Video coverage with highlight film and editing',1000.00,'photography'),(23,'DJ Service','Professional DJ with basic sound system',400.00,'music'),(24,'Live Band','3-piece live band performance for 3 hours',1200.00,'music'),(25,'Venue Booking','Basic venue booking for 4 hours',1000.00,'venue'),(26,'Premium Venue','Luxury venue with all facilities',2500.00,'venue'),(27,'Basic Decoration','Basic floral and lighting decoration for any event',500.00,'decoration'),(28,'Premium Decoration','Luxury decoration with theme setup and custom designs',1200.00,'decoration'),(29,'Buffet Service','Standard buffet service for up to 50 people',800.00,'catering'),(30,'Sit-down Dinner','Formal dining service with wait staff',1500.00,'catering'),(31,'Photography Basic','4 hours coverage with 100 edited photos',600.00,'photography'),(32,'Videography Package','Video coverage with highlight film and editing',1000.00,'photography'),(33,'DJ Service','Professional DJ with basic sound system',400.00,'music'),(34,'Live Band','3-piece live band performance for 3 hours',1200.00,'music'),(35,'Venue Booking','Basic venue booking for 4 hours',1000.00,'venue'),(36,'Premium Venue','Luxury venue with all facilities',2500.00,'venue'),(37,'Basic Decoration','Basic floral and lighting decoration for any event',500.00,'decoration'),(38,'Premium Decoration','Luxury decoration with theme setup and custom designs',1200.00,'decoration'),(39,'Buffet Service','Standard buffet service for up to 50 people',800.00,'catering'),(40,'Sit-down Dinner','Formal dining service with wait staff',1500.00,'catering'),(41,'Photography Basic','4 hours coverage with 100 edited photos',600.00,'photography'),(42,'Videography Package','Video coverage with highlight film and editing',1000.00,'photography'),(43,'DJ Service','Professional DJ with basic sound system',400.00,'music'),(44,'Live Band','3-piece live band performance for 3 hours',1200.00,'music'),(45,'Venue Booking','Basic venue booking for 4 hours',1000.00,'venue'),(46,'Premium Venue','Luxury venue with all facilities',2500.00,'venue');
/*!40000 ALTER TABLE `services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','organizer','admin') DEFAULT 'user',
  `full_name` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username` (`username`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'john@example.com','john@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeMRZz8Z7.5J/Qj.6q9L5.4GtV1J1qW7a','user',NULL,'123-456-7890','2026-01-09 15:02:13'),(2,'organizer@example.com','organizer@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeMRZz8Z7.5J/Qj.6q9L5.4GtV1J1qW7a','organizer',NULL,'987-654-3210','2026-01-09 15:02:13'),(3,'admin@example.com','admin@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMyeMRZz8Z7.5J/Qj.6q9L5.4GtV1J1qW7a','user',NULL,'555-123-4567','2026-01-09 15:02:13'),(8,'admin@eventpro.com','admin@eventpro.com','$2a$10$N9qo8uLOickgx2ZMRZoMye7Z7JYwYQzBm6vP8pZc3nJ3JYwYQzBm6v','admin',NULL,'+1234567890','2026-01-09 17:44:19'),(9,'sarah_new@example.com','sarah_new@example.com','$2a$10$N9qo8uLOickgx2ZMRZoMye7Z7JYwYQzBm6vP8pZc3nJ3JYwYQzBm6v','user',NULL,'+1555777888','2026-01-09 17:44:19'),(10,'organizer@eventpro.com','organizer@eventpro.com','$2a$10$N9qo8uLOickgx2ZMRZoMye7Z7JYwYQzBm6vP8pZc3nJ3JYwYQzBm6v','organizer',NULL,'+1555987654','2026-01-09 17:44:19'),(12,'pratik123','maccpratik@gmail.com','$2a$10$UKiS6CjLCRUHvuS/HNbTkOCli7fIxg69I0GSfiA.r10R.iXCUSXYG','user','pratik ausarmal','8605352240','2026-01-10 08:15:17'),(13,'yogesh123','yogeshkplate1@gmail.com','$2a$10$HUIjyUOFWY6YQWSw1u2nz.E0Du39ECl3uqds4xl0HlXIacS4YFqde','user','Yogesh kolate','8087781034','2026-01-10 08:16:32'),(14,'pratik003','pratikausarmal160@gmail.com','$2a$10$so03/jK7n5pVuat0d8.QauIgaeiq38qvTiNZchUbv1cqgH/Dk6Fl.','admin','pratik ausarmal','7499950217','2026-01-13 03:52:45');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-20 10:13:20
