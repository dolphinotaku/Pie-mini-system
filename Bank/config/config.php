<?php

date_default_timezone_set('Asia/Hong_Kong');

/**
 * Configuration for: Database Connection
 *
 * DB_HOST: database host, usually it's "127.0.0.1" or "localhost", some servers also need port info
 * DB_NAME: name of the database. please note: database and database table are not the same thing
 * DB_USER: user for your database. the user needs to have rights for SELECT, UPDATE, DELETE and INSERT.
 * DB_PASS: the password of the above user
 */
define("_DB_HOST", "192.168.0.190", true);
define("_DB_NAME", "nijyuuamineex_pims", true);
define("_DB_USER", "pims_admin", true);
define("_DB_PASS", "Admin_pims_23", true);

/**
 * Configuration for: Database Connection
 *
 * DOMIAN_NAME: your site domian name
 * THIRD_PARTY_PATH: store all the in used third party tools
 * RESOURSE_PATH: the directory of mail merge word template
 * TEMP_PATH: the directory of temporary to store some files, such as a excel prepare for download
 */
define("DOMIAN_NAME", "192.168.0.190/Bank/");


/**
 * Configuration for: SecurityManager
 *
 * PASSWORD_HASH: hash method
 */
define("PASSWORD_HASH", "sha1");

/**
 * Base Path of thrid party resource
 *
 * INCLUDE_PHPMAILER: PHPMailer open source, create email, set from/to, add cc, add bcc, add attachment in object oriented
 */
?>