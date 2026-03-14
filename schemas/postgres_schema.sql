--
-- PostgreSQL database dump
--

\restrict nwqCiUHC0ZqVdJx8j24Hj44RxWaJIHjfBRKq6xB9vjc3dbhrnGXqpoxFCL8ert5

-- Dumped from database version 16.13 (Debian 16.13-1.pgdg12+1)
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: btree_gin; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS btree_gin WITH SCHEMA public;


--
-- Name: EXTENSION btree_gin; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION btree_gin IS 'support for indexing common datatypes in GIN';


--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: insert_user_with_details(text, timestamp with time zone, text, integer, integer, text, text, integer, text, numeric, numeric, text, integer, integer, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.insert_user_with_details(p_identifier text, p_last_login timestamp with time zone, p_password text, p_client_id integer, p_language_id integer, p_timezone text, p_device_token text, p_device_type integer, p_device_version text, p_longitude numeric, p_latitude numeric, p_device_id text, p_avatar_id integer, p_secret_question_id integer, p_secret_answer text) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_user_id INTEGER;
BEGIN
    -- Insert into authentication_user
    INSERT INTO authentication_user (
        username,
        password,
        is_active,
        is_staff,
        is_superuser,
        last_login,
        created_date,
        modified_date,
        current_client_info_id
    ) VALUES (
        p_identifier,
        p_password,
        true,
        false,
        false,
        p_last_login,
        NOW(),
        NOW(),
        p_client_id
    ) RETURNING id INTO v_user_id;

    -- Insert into authentication_contactinfo
    INSERT INTO authentication_contactinfo (
        user_id,
        identifier,
        device_token,
        device_type,
        device_version,
        latitude,
        longitude,
        registration_channel,
        registration_date,
        self_registered
    ) VALUES (
        v_user_id,
        p_identifier,
        p_device_token,
        p_device_type,
        p_device_version,
        p_latitude,
        p_longitude,
        1,
        NOW(),
        true
    );

    -- Insert into authentication_usersettings
    INSERT INTO authentication_usersettings (
        user_id,
        language_id,
        timezone,
        allow_emails,
        theme_colour,
        profile_img
    ) VALUES (
        v_user_id,
        p_language_id,
        p_timezone,
        true,
        '',
        ''
    );

    -- Insert into authentication_userassociateddevice
    INSERT INTO authentication_userassociateddevice (
        user_id,
        device_id,
        avatar_id,
        secret_question_id,
        secret_answer
    ) VALUES (
        v_user_id,
        p_device_id,
        p_avatar_id,
        p_secret_question_id,
        p_secret_answer
    );

    RETURN v_user_id;
END;
$$;


ALTER FUNCTION public.insert_user_with_details(p_identifier text, p_last_login timestamp with time zone, p_password text, p_client_id integer, p_language_id integer, p_timezone text, p_device_token text, p_device_type integer, p_device_version text, p_longitude numeric, p_latitude numeric, p_device_id text, p_avatar_id integer, p_secret_question_id integer, p_secret_answer text) OWNER TO postgres;

--
-- Name: insert_user_with_details(character varying, timestamp without time zone, character varying, integer, integer, character varying, character varying, integer, character varying, numeric, numeric, character varying, integer, integer, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.insert_user_with_details(p_identifier character varying, p_last_login timestamp without time zone, p_password character varying, p_client_id integer, p_language_id integer, p_timezone character varying, p_device_token character varying, p_device_type integer, p_device_version character varying, p_longitude numeric, p_latitude numeric, p_device_id character varying, p_avatar_id integer, p_secret_question_id integer, p_secret_answer character varying) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_user_id INTEGER;
BEGIN
    -- Insert into authentication_user
    INSERT INTO authentication_user (
        username,
        password,
        is_active,
        is_staff,
        is_superuser,
        last_login,
        created_date,
        modified_date,
        current_client_info_id
    ) VALUES (
        p_identifier,
        p_password,
        true,
        false,
        false,
        p_last_login,
        NOW(),
        NOW(),
        p_client_id
    ) RETURNING id INTO v_user_id;

    -- Insert into authentication_contactinfo
    INSERT INTO authentication_contactinfo (
        user_id,
        identifier,
        device_token,
        device_type,
        device_version,
        latitude,
        longitude,
        registration_channel,
        registration_date,
        self_registered
    ) VALUES (
        v_user_id,
        p_identifier,
        p_device_token,
        p_device_type,
        p_device_version,
        p_latitude,
        p_longitude,
        1,
        NOW(),
        true
    );

    -- Insert into authentication_usersettings
    INSERT INTO authentication_usersettings (
        user_id,
        language_id,
        timezone,
        allow_emails
    ) VALUES (
        v_user_id,
        p_language_id,
        p_timezone,
        true
    );

    -- Insert into authentication_userassociateddevice
    INSERT INTO authentication_userassociateddevice (
        user_id,
        device_id,
        avatar_id,
        secret_question_id,
        secret_answer
    ) VALUES (
        v_user_id,
        p_device_id,
        p_avatar_id,
        p_secret_question_id,
        p_secret_answer
    );

    RETURN v_user_id;
END;
$$;


ALTER FUNCTION public.insert_user_with_details(p_identifier character varying, p_last_login timestamp without time zone, p_password character varying, p_client_id integer, p_language_id integer, p_timezone character varying, p_device_token character varying, p_device_type integer, p_device_version character varying, p_longitude numeric, p_latitude numeric, p_device_id character varying, p_avatar_id integer, p_secret_question_id integer, p_secret_answer character varying) OWNER TO postgres;

--
-- Name: insert_user_with_details(text, text, timestamp with time zone, text, integer, integer, text, text, integer, text, numeric, numeric, text, integer, integer, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.insert_user_with_details(p_identifier text, p_employee_id text, p_last_login timestamp with time zone, p_password text, p_client_id integer, p_language_id integer, p_timezone text, p_device_token text, p_device_type integer, p_device_version text, p_longitude numeric, p_latitude numeric, p_device_id text, p_avatar_id integer, p_secret_question_id integer, p_secret_answer text) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_user_id INTEGER;
BEGIN
    -- Insert into authentication_user
    INSERT INTO authentication_user (
        username,
        password,
        is_active,
        is_staff,
        is_superuser,
        last_login,
        created_date,
        modified_date,
        current_client_info_id
    ) VALUES (
        p_identifier,
        p_password,
        true,
        false,
        false,
        p_last_login,
        NOW(),
        NOW(),
        p_client_id
    ) RETURNING id INTO v_user_id;

    -- Insert into authentication_contactinfo
    INSERT INTO authentication_contactinfo (
        user_id,
        employee_id,
        identifier,
        device_token,
        device_type,
        device_version,
        latitude,
        longitude,
        registration_channel,
        registration_date,
        self_registered
    ) VALUES (
        v_user_id,
        p_employee_id,
        p_identifier,
        p_device_token,
        p_device_type,
        p_device_version,
        p_latitude,
        p_longitude,
        1,
        NOW(),
        true
    );

    -- Insert into authentication_usersettings
    INSERT INTO authentication_usersettings (
        user_id,
        language_id,
        timezone,
        allow_emails,
        theme_colour,
        profile_img
    ) VALUES (
        v_user_id,
        p_language_id,
        p_timezone,
        true,
        '',
        ''
    );

    -- Insert into authentication_userassociateddevice
    INSERT INTO authentication_userassociateddevice (
        user_id,
        device_id,
        avatar_id,
        secret_question_id,
        secret_answer
    ) VALUES (
        v_user_id,
        p_device_id,
        p_avatar_id,
        p_secret_question_id,
        p_secret_answer
    );

    RETURN v_user_id;
END;
$$;


ALTER FUNCTION public.insert_user_with_details(p_identifier text, p_employee_id text, p_last_login timestamp with time zone, p_password text, p_client_id integer, p_language_id integer, p_timezone text, p_device_token text, p_device_type integer, p_device_version text, p_longitude numeric, p_latitude numeric, p_device_id text, p_avatar_id integer, p_secret_question_id integer, p_secret_answer text) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: account_managers_mdlaccountmanagers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.account_managers_mdlaccountmanagers (
    id uuid NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    created_by character varying(255),
    modified_by character varying(256),
    client_id integer NOT NULL,
    identifier text,
    name text,
    email text,
    phone text,
    is_active boolean NOT NULL
);


ALTER TABLE public.account_managers_mdlaccountmanagers OWNER TO postgres;

--
-- Name: account_managers_mdlaccountmanagers_countries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.account_managers_mdlaccountmanagers_countries (
    id bigint NOT NULL,
    mdlaccountmanagers_id uuid NOT NULL,
    mdlaccountmanagerscountry_id uuid NOT NULL
);


ALTER TABLE public.account_managers_mdlaccountmanagers_countries OWNER TO postgres;

--
-- Name: account_managers_mdlaccountmanagers_countries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.account_managers_mdlaccountmanagers_countries ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.account_managers_mdlaccountmanagers_countries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: account_managers_mdlaccountmanagerscountry; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.account_managers_mdlaccountmanagerscountry (
    id uuid NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    created_by character varying(255),
    modified_by character varying(256),
    client_id integer NOT NULL,
    country text NOT NULL
);


ALTER TABLE public.account_managers_mdlaccountmanagerscountry OWNER TO postgres;

--
-- Name: auth_group; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_group (
    id integer NOT NULL,
    name character varying(150) NOT NULL
);


ALTER TABLE public.auth_group OWNER TO postgres;

--
-- Name: auth_group_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.auth_group ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auth_group_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: auth_group_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_group_permissions (
    id bigint NOT NULL,
    group_id integer NOT NULL,
    permission_id integer NOT NULL
);


ALTER TABLE public.auth_group_permissions OWNER TO postgres;

--
-- Name: auth_group_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.auth_group_permissions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auth_group_permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: auth_permission; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_permission (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    content_type_id integer NOT NULL,
    codename character varying(100) NOT NULL
);


ALTER TABLE public.auth_permission OWNER TO postgres;

--
-- Name: auth_permission_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.auth_permission ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auth_permission_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: authentication_avatar; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.authentication_avatar (
    id bigint NOT NULL,
    name character varying(100) NOT NULL,
    image character varying(100)
);


ALTER TABLE public.authentication_avatar OWNER TO postgres;

--
-- Name: authentication_avatar_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.authentication_avatar ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.authentication_avatar_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: authentication_contactinfo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.authentication_contactinfo (
    user_id bigint NOT NULL,
    employee_id character varying(100),
    identifier character varying(100),
    phone_number character varying(100),
    device_token character varying(500),
    device_type integer,
    device_version character varying(100),
    app_version character varying(20),
    department_value_id integer,
    department_name character varying(100),
    latitude numeric(9,6),
    longitude numeric(9,6),
    registration_channel integer NOT NULL,
    registration_date timestamp with time zone,
    self_registered boolean,
    is_logged_in boolean,
    we_chat_id character varying(200),
    last_channel_id character varying(3)
);


ALTER TABLE public.authentication_contactinfo OWNER TO postgres;

--
-- Name: authentication_module; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.authentication_module (
    id uuid NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    created_by_id bigint,
    modified_by_id bigint,
    title text NOT NULL,
    module_key text NOT NULL,
    is_active boolean NOT NULL,
    display_order integer NOT NULL,
    is_enabled_by_default boolean NOT NULL,
    is_enabled_for_brand boolean NOT NULL,
    parent_id uuid
);


ALTER TABLE public.authentication_module OWNER TO postgres;

--
-- Name: authentication_modulemappingfornet; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.authentication_modulemappingfornet (
    id bigint NOT NULL,
    net_module integer NOT NULL,
    created_date timestamp with time zone NOT NULL,
    modified_date timestamp with time zone NOT NULL,
    created_by_id bigint,
    modified_by_id bigint,
    module_id uuid NOT NULL
);


ALTER TABLE public.authentication_modulemappingfornet OWNER TO postgres;

--
-- Name: authentication_modulemappingfornet_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.authentication_modulemappingfornet ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.authentication_modulemappingfornet_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: authentication_passwordtoken; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.authentication_passwordtoken (
    id bigint NOT NULL,
    token character varying(256) NOT NULL,
    user_id bigint NOT NULL
);


ALTER TABLE public.authentication_passwordtoken OWNER TO postgres;

--
-- Name: authentication_passwordtoken_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.authentication_passwordtoken ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.authentication_passwordtoken_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: authentication_role; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.authentication_role (
    id bigint NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    is_system boolean NOT NULL,
    is_active boolean NOT NULL,
    is_deleted boolean NOT NULL,
    created_by_id bigint,
    modified_by_id bigint,
    created_date timestamp with time zone NOT NULL,
    modified_date timestamp with time zone NOT NULL,
    last_sync_date timestamp with time zone,
    parent_id bigint
);


ALTER TABLE public.authentication_role OWNER TO postgres;

--
-- Name: authentication_role_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.authentication_role ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.authentication_role_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: authentication_roleassociatedmodule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.authentication_roleassociatedmodule (
    id bigint NOT NULL,
    module_id uuid NOT NULL,
    role_id bigint NOT NULL
);


ALTER TABLE public.authentication_roleassociatedmodule OWNER TO postgres;

--
-- Name: authentication_roleassociatedmodule_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.authentication_roleassociatedmodule ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.authentication_roleassociatedmodule_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: authentication_secretquestion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.authentication_secretquestion (
    id bigint NOT NULL,
    question character varying(100) NOT NULL,
    translations jsonb
);


ALTER TABLE public.authentication_secretquestion OWNER TO postgres;

--
-- Name: authentication_secretquestion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.authentication_secretquestion ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.authentication_secretquestion_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: authentication_user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.authentication_user (
    id bigint NOT NULL,
    last_login timestamp with time zone,
    is_superuser boolean NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    email character varying(100),
    username character varying(100) NOT NULL,
    password character varying(250),
    is_active boolean NOT NULL,
    is_staff boolean NOT NULL,
    created_date timestamp with time zone NOT NULL,
    modified_date timestamp with time zone NOT NULL,
    deactivated_date timestamp with time zone,
    last_sync_time timestamp with time zone,
    created_by_id bigint,
    current_client_info_id bigint,
    deactivated_by_id bigint,
    modified_by_id bigint,
    role_id bigint,
    data jsonb
);


ALTER TABLE public.authentication_user OWNER TO postgres;

--
-- Name: authentication_user_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.authentication_user_groups (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    group_id integer NOT NULL
);


ALTER TABLE public.authentication_user_groups OWNER TO postgres;

--
-- Name: authentication_user_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.authentication_user_groups ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.authentication_user_groups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: authentication_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.authentication_user ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.authentication_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: authentication_user_user_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.authentication_user_user_permissions (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    permission_id integer NOT NULL
);


ALTER TABLE public.authentication_user_user_permissions OWNER TO postgres;

--
-- Name: authentication_user_user_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.authentication_user_user_permissions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.authentication_user_user_permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: authentication_userassociatedclient; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.authentication_userassociatedclient (
    id bigint NOT NULL,
    client_info_id bigint NOT NULL,
    user_id bigint NOT NULL
);


ALTER TABLE public.authentication_userassociatedclient OWNER TO postgres;

--
-- Name: authentication_userassociatedclient_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.authentication_userassociatedclient ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.authentication_userassociatedclient_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: authentication_userassociateddevice; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.authentication_userassociateddevice (
    id bigint NOT NULL,
    device_id character varying(256) NOT NULL,
    secret_answer character varying(256) NOT NULL,
    avatar_id bigint NOT NULL,
    secret_question_id bigint NOT NULL,
    user_id bigint NOT NULL
);


ALTER TABLE public.authentication_userassociateddevice OWNER TO postgres;

--
-- Name: authentication_userassociateddevice_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.authentication_userassociateddevice ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.authentication_userassociateddevice_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: authentication_usersettings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.authentication_usersettings (
    id bigint NOT NULL,
    timezone character varying(100),
    theme_colour text NOT NULL,
    profile_img character varying(100) NOT NULL,
    allow_emails boolean NOT NULL,
    language_id bigint,
    preferred_font_id uuid,
    user_id bigint NOT NULL
);


ALTER TABLE public.authentication_usersettings OWNER TO postgres;

--
-- Name: authentication_usersettings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.authentication_usersettings ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.authentication_usersettings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: client_modules_modulemappingfornet; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_modules_modulemappingfornet (
    id bigint NOT NULL,
    net_module integer NOT NULL,
    created_date timestamp with time zone NOT NULL,
    modified_date timestamp with time zone NOT NULL,
    created_by integer NOT NULL,
    modified_by integer NOT NULL,
    module_id uuid NOT NULL
);


ALTER TABLE public.client_modules_modulemappingfornet OWNER TO postgres;

--
-- Name: client_modules_modulemappingfornet_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.client_modules_modulemappingfornet ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.client_modules_modulemappingfornet_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: client_pic_mdlclientpic; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_pic_mdlclientpic (
    id bigint NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    created_by integer,
    identifier character varying(50),
    name text,
    email text,
    is_active boolean NOT NULL,
    modified_by character varying(50)
);


ALTER TABLE public.client_pic_mdlclientpic OWNER TO postgres;

--
-- Name: client_pic_mdlclientpic_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.client_pic_mdlclientpic ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.client_pic_mdlclientpic_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: clients_appchannels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clients_appchannels (
    id bigint NOT NULL,
    app boolean NOT NULL,
    app_value character varying(128),
    sms boolean NOT NULL,
    sms_value character varying(32),
    we_chat boolean NOT NULL,
    we_chat_value character varying(32)
);


ALTER TABLE public.clients_appchannels OWNER TO postgres;

--
-- Name: clients_appchannels_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.clients_appchannels ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.clients_appchannels_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: clients_bulkaccountuploadedfile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clients_bulkaccountuploadedfile (
    id bigint NOT NULL,
    status integer NOT NULL,
    created_date timestamp with time zone NOT NULL,
    modified_date timestamp with time zone NOT NULL,
    deleted_date timestamp with time zone,
    created_by integer NOT NULL,
    modified_by integer,
    deleted boolean NOT NULL,
    opt_start_date timestamp with time zone,
    opt_end_date timestamp with time zone,
    total_count integer NOT NULL,
    created_count integer NOT NULL,
    failed_count integer NOT NULL,
    report_link character varying(1024),
    uploaded_file_link character varying(1024),
    uploaded_json_file_link character varying(1024),
    uploaded_file_name character varying(64) NOT NULL
);


ALTER TABLE public.clients_bulkaccountuploadedfile OWNER TO postgres;

--
-- Name: clients_bulkaccountuploadedfile_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.clients_bulkaccountuploadedfile ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.clients_bulkaccountuploadedfile_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: clients_clientinfo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clients_clientinfo (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    client_key integer,
    client_id character varying(128) NOT NULL,
    country character varying(64),
    is_active boolean NOT NULL,
    additional_info character varying(200),
    created_at timestamp with time zone NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    deleted_date timestamp with time zone,
    created_by integer,
    modified_by integer,
    is_anonymous boolean NOT NULL,
    allow_connect_raw_data_download boolean NOT NULL,
    allow_survey_raw_data_download boolean NOT NULL,
    allow_questionnaire_raw_data_download boolean NOT NULL,
    app_channel_id bigint,
    country_mapping_id integer,
    custom_field_values jsonb,
    cxm_email integer,
    industry_values jsonb,
    is_deleted boolean NOT NULL,
    legal_company_name character varying(255),
    timezone character varying(128),
    logo character varying(512),
    last_sync_date timestamp with time zone
);


ALTER TABLE public.clients_clientinfo OWNER TO postgres;

--
-- Name: clients_clientinfo_client_pic; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clients_clientinfo_client_pic (
    id bigint NOT NULL,
    clientinfo_id bigint NOT NULL,
    clientpic_id bigint NOT NULL
);


ALTER TABLE public.clients_clientinfo_client_pic OWNER TO postgres;

--
-- Name: clients_clientinfo_client_pic_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.clients_clientinfo_client_pic ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.clients_clientinfo_client_pic_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: clients_clientinfo_dashboard_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clients_clientinfo_dashboard_type (
    id bigint NOT NULL,
    clientinfo_id bigint NOT NULL,
    dashboardtype_id bigint NOT NULL
);


ALTER TABLE public.clients_clientinfo_dashboard_type OWNER TO postgres;

--
-- Name: clients_clientinfo_dashboard_type_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.clients_clientinfo_dashboard_type ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.clients_clientinfo_dashboard_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: clients_clientinfo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.clients_clientinfo ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.clients_clientinfo_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: clients_clientinfotorelationmapping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clients_clientinfotorelationmapping (
    id bigint NOT NULL,
    clientinfo_id bigint NOT NULL,
    clientrelation_id bigint NOT NULL
);


ALTER TABLE public.clients_clientinfotorelationmapping OWNER TO postgres;

--
-- Name: clients_clientinfo_relation_mapping_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.clients_clientinfotorelationmapping ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.clients_clientinfo_relation_mapping_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: clients_clientinfo_secondary_languages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clients_clientinfo_secondary_languages (
    id bigint NOT NULL,
    clientinfo_id bigint NOT NULL,
    secondarylanguages_id bigint NOT NULL
);


ALTER TABLE public.clients_clientinfo_secondary_languages OWNER TO postgres;

--
-- Name: clients_clientinfo_secondary_languages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.clients_clientinfo_secondary_languages ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.clients_clientinfo_secondary_languages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: clients_clientinfoassociatedmodule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clients_clientinfoassociatedmodule (
    id bigint NOT NULL,
    is_active boolean NOT NULL,
    created_date timestamp with time zone NOT NULL,
    modified_date timestamp with time zone NOT NULL,
    client_info_id bigint NOT NULL,
    created_by_id bigint NOT NULL,
    modified_by_id bigint NOT NULL,
    module_id uuid NOT NULL
);


ALTER TABLE public.clients_clientinfoassociatedmodule OWNER TO postgres;

--
-- Name: clients_clientinfoassociatedmodule_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.clients_clientinfoassociatedmodule ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.clients_clientinfoassociatedmodule_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: clients_clientinfocustomfielddata; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clients_clientinfocustomfielddata (
    id bigint NOT NULL,
    value character varying(200)[],
    option_value integer[],
    is_deleted boolean NOT NULL,
    created_date timestamp with time zone NOT NULL,
    clientinfo_id bigint NOT NULL,
    custom_field_id bigint NOT NULL
);


ALTER TABLE public.clients_clientinfocustomfielddata OWNER TO postgres;

--
-- Name: clients_clientinfocustomfielddata_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.clients_clientinfocustomfielddata ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.clients_clientinfocustomfielddata_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: clients_clientinfotoindustriesmapping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clients_clientinfotoindustriesmapping (
    id bigint NOT NULL,
    clientinfo_id bigint NOT NULL,
    industry_id bigint NOT NULL
);


ALTER TABLE public.clients_clientinfotoindustriesmapping OWNER TO postgres;

--
-- Name: clients_clientinfotoindustriesmapping_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.clients_clientinfotoindustriesmapping ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.clients_clientinfotoindustriesmapping_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: clients_clientinfotolanguagesmapping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clients_clientinfotolanguagesmapping (
    id bigint NOT NULL,
    clientinfo_id bigint NOT NULL,
    language_id bigint NOT NULL
);


ALTER TABLE public.clients_clientinfotolanguagesmapping OWNER TO postgres;

--
-- Name: clients_clientinfotolanguagesmapping_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.clients_clientinfotolanguagesmapping ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.clients_clientinfotolanguagesmapping_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: clients_clientpic; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clients_clientpic (
    id bigint NOT NULL,
    name character varying(128),
    email character varying(128)
);


ALTER TABLE public.clients_clientpic OWNER TO postgres;

--
-- Name: clients_clientpic_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.clients_clientpic ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.clients_clientpic_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: clients_clientrelation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clients_clientrelation (
    id bigint NOT NULL,
    relation_id integer NOT NULL,
    relation_type integer NOT NULL,
    is_wovo_relation boolean NOT NULL
);


ALTER TABLE public.clients_clientrelation OWNER TO postgres;

--
-- Name: clients_clientrelation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.clients_clientrelation ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.clients_clientrelation_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: clients_country; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clients_country (
    id integer NOT NULL,
    created_date timestamp with time zone NOT NULL,
    modified_date timestamp with time zone NOT NULL,
    created_by integer NOT NULL,
    modified_by integer NOT NULL,
    name text,
    dial_code text,
    is_active boolean,
    country_code integer,
    country_id integer,
    long_code text NOT NULL,
    short_code text NOT NULL,
    is_deleted boolean NOT NULL,
    country_flag character varying(2)
);


ALTER TABLE public.clients_country OWNER TO postgres;

--
-- Name: clients_customfield; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clients_customfield (
    id bigint NOT NULL,
    name character varying(50) NOT NULL,
    field_type character varying(100) NOT NULL,
    reveal boolean NOT NULL,
    required boolean NOT NULL,
    editable_by_child boolean NOT NULL,
    is_active boolean NOT NULL,
    is_deleted boolean NOT NULL,
    created_date timestamp with time zone NOT NULL,
    modified_date timestamp with time zone NOT NULL,
    deleted_date timestamp with time zone,
    created_by integer NOT NULL,
    modified_by integer NOT NULL,
    deleted_by integer,
    clientinfo_id bigint NOT NULL
);


ALTER TABLE public.clients_customfield OWNER TO postgres;

--
-- Name: clients_customfield_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.clients_customfield ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.clients_customfield_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: clients_dashboardtype; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clients_dashboardtype (
    id bigint NOT NULL,
    name character varying(64) NOT NULL,
    type integer NOT NULL
);


ALTER TABLE public.clients_dashboardtype OWNER TO postgres;

--
-- Name: clients_dashboardtype_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.clients_dashboardtype ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.clients_dashboardtype_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: clients_industry; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clients_industry (
    id bigint NOT NULL,
    name text NOT NULL,
    is_active boolean NOT NULL,
    created_by integer NOT NULL,
    created_date timestamp with time zone NOT NULL,
    industry_field_values jsonb,
    is_deleted boolean NOT NULL,
    modified_by integer NOT NULL,
    modified_date timestamp with time zone NOT NULL
);


ALTER TABLE public.clients_industry OWNER TO postgres;

--
-- Name: clients_mdlclientkeycounter; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clients_mdlclientkeycounter (
    id uuid NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    counter integer NOT NULL
);


ALTER TABLE public.clients_mdlclientkeycounter OWNER TO postgres;

--
-- Name: clients_optionvalue; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clients_optionvalue (
    id bigint NOT NULL,
    value character varying(200) NOT NULL,
    is_active boolean NOT NULL,
    custom_field_id bigint NOT NULL
);


ALTER TABLE public.clients_optionvalue OWNER TO postgres;

--
-- Name: clients_optionvalue_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.clients_optionvalue ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.clients_optionvalue_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: clients_secondarylanguages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clients_secondarylanguages (
    id bigint NOT NULL,
    name character varying(128)
);


ALTER TABLE public.clients_secondarylanguages OWNER TO postgres;

--
-- Name: clients_secondarylanguages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.clients_secondarylanguages ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.clients_secondarylanguages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: company_lesson_association; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.company_lesson_association (
    id bigint NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    company_id integer NOT NULL,
    lesson_type character varying(100) NOT NULL,
    scorm_idnumber character varying(100) NOT NULL,
    lesson_id integer NOT NULL,
    english_lesson_name character varying(255) NOT NULL
);


ALTER TABLE public.company_lesson_association OWNER TO postgres;

--
-- Name: company_lesson_association_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.company_lesson_association ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.company_lesson_association_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: django_admin_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.django_admin_log (
    id integer NOT NULL,
    action_time timestamp with time zone NOT NULL,
    object_id text,
    object_repr character varying(200) NOT NULL,
    action_flag smallint NOT NULL,
    change_message text NOT NULL,
    content_type_id integer,
    user_id bigint NOT NULL,
    CONSTRAINT django_admin_log_action_flag_check CHECK ((action_flag >= 0))
);


ALTER TABLE public.django_admin_log OWNER TO postgres;

--
-- Name: django_admin_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.django_admin_log ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.django_admin_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: django_celery_beat_clockedschedule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.django_celery_beat_clockedschedule (
    id integer NOT NULL,
    clocked_time timestamp with time zone NOT NULL
);


ALTER TABLE public.django_celery_beat_clockedschedule OWNER TO postgres;

--
-- Name: django_celery_beat_clockedschedule_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.django_celery_beat_clockedschedule ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.django_celery_beat_clockedschedule_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: django_celery_beat_crontabschedule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.django_celery_beat_crontabschedule (
    id integer NOT NULL,
    minute character varying(240) NOT NULL,
    hour character varying(96) NOT NULL,
    day_of_week character varying(64) NOT NULL,
    day_of_month character varying(124) NOT NULL,
    month_of_year character varying(64) NOT NULL,
    timezone character varying(63) NOT NULL
);


ALTER TABLE public.django_celery_beat_crontabschedule OWNER TO postgres;

--
-- Name: django_celery_beat_crontabschedule_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.django_celery_beat_crontabschedule ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.django_celery_beat_crontabschedule_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: django_celery_beat_intervalschedule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.django_celery_beat_intervalschedule (
    id integer NOT NULL,
    every integer NOT NULL,
    period character varying(24) NOT NULL
);


ALTER TABLE public.django_celery_beat_intervalschedule OWNER TO postgres;

--
-- Name: django_celery_beat_intervalschedule_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.django_celery_beat_intervalschedule ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.django_celery_beat_intervalschedule_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: django_celery_beat_periodictask; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.django_celery_beat_periodictask (
    id integer NOT NULL,
    name character varying(200) NOT NULL,
    task character varying(200) NOT NULL,
    args text NOT NULL,
    kwargs text NOT NULL,
    queue character varying(200),
    exchange character varying(200),
    routing_key character varying(200),
    expires timestamp with time zone,
    enabled boolean NOT NULL,
    last_run_at timestamp with time zone,
    total_run_count integer NOT NULL,
    date_changed timestamp with time zone NOT NULL,
    description text NOT NULL,
    crontab_id integer,
    interval_id integer,
    solar_id integer,
    one_off boolean NOT NULL,
    start_time timestamp with time zone,
    priority integer,
    headers text NOT NULL,
    clocked_id integer,
    expire_seconds integer,
    CONSTRAINT django_celery_beat_periodictask_expire_seconds_check CHECK ((expire_seconds >= 0)),
    CONSTRAINT django_celery_beat_periodictask_priority_check CHECK ((priority >= 0)),
    CONSTRAINT django_celery_beat_periodictask_total_run_count_check CHECK ((total_run_count >= 0))
);


ALTER TABLE public.django_celery_beat_periodictask OWNER TO postgres;

--
-- Name: django_celery_beat_periodictask_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.django_celery_beat_periodictask ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.django_celery_beat_periodictask_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: django_celery_beat_periodictasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.django_celery_beat_periodictasks (
    ident smallint NOT NULL,
    last_update timestamp with time zone NOT NULL
);


ALTER TABLE public.django_celery_beat_periodictasks OWNER TO postgres;

--
-- Name: django_celery_beat_solarschedule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.django_celery_beat_solarschedule (
    id integer NOT NULL,
    event character varying(24) NOT NULL,
    latitude numeric(9,6) NOT NULL,
    longitude numeric(9,6) NOT NULL
);


ALTER TABLE public.django_celery_beat_solarschedule OWNER TO postgres;

--
-- Name: django_celery_beat_solarschedule_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.django_celery_beat_solarschedule ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.django_celery_beat_solarschedule_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: django_celery_results_chordcounter; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.django_celery_results_chordcounter (
    id integer NOT NULL,
    group_id character varying(255) NOT NULL,
    sub_tasks text NOT NULL,
    count integer NOT NULL,
    CONSTRAINT django_celery_results_chordcounter_count_check CHECK ((count >= 0))
);


ALTER TABLE public.django_celery_results_chordcounter OWNER TO postgres;

--
-- Name: django_celery_results_chordcounter_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.django_celery_results_chordcounter ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.django_celery_results_chordcounter_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: django_celery_results_groupresult; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.django_celery_results_groupresult (
    id integer NOT NULL,
    group_id character varying(255) NOT NULL,
    date_created timestamp with time zone NOT NULL,
    date_done timestamp with time zone NOT NULL,
    content_type character varying(128) NOT NULL,
    content_encoding character varying(64) NOT NULL,
    result text
);


ALTER TABLE public.django_celery_results_groupresult OWNER TO postgres;

--
-- Name: django_celery_results_groupresult_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.django_celery_results_groupresult ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.django_celery_results_groupresult_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: django_celery_results_taskresult; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.django_celery_results_taskresult (
    id integer NOT NULL,
    task_id character varying(255) NOT NULL,
    status character varying(50) NOT NULL,
    content_type character varying(128) NOT NULL,
    content_encoding character varying(64) NOT NULL,
    result text,
    date_done timestamp with time zone NOT NULL,
    traceback text,
    meta text,
    task_args text,
    task_kwargs text,
    task_name character varying(255),
    worker character varying(100),
    date_created timestamp with time zone NOT NULL,
    periodic_task_name character varying(255)
);


ALTER TABLE public.django_celery_results_taskresult OWNER TO postgres;

--
-- Name: django_celery_results_taskresult_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.django_celery_results_taskresult ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.django_celery_results_taskresult_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: django_celery_task; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.django_celery_task (
    queue character varying(200),
    id character varying(512) NOT NULL,
    task_name character varying(200),
    task_args jsonb,
    task_kwargs jsonb,
    task_result jsonb,
    status character varying(200) NOT NULL,
    scheduled_date timestamp with time zone NOT NULL,
    expiry_date timestamp with time zone,
    created_date timestamp with time zone NOT NULL,
    modified_date timestamp with time zone NOT NULL,
    created_by integer,
    is_read boolean
);


ALTER TABLE public.django_celery_task OWNER TO postgres;

--
-- Name: django_content_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.django_content_type (
    id integer NOT NULL,
    app_label character varying(100) NOT NULL,
    model character varying(100) NOT NULL
);


ALTER TABLE public.django_content_type OWNER TO postgres;

--
-- Name: django_content_type_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.django_content_type ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.django_content_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: django_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.django_migrations (
    id bigint NOT NULL,
    app character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    applied timestamp with time zone NOT NULL
);


ALTER TABLE public.django_migrations OWNER TO postgres;

--
-- Name: django_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.django_migrations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.django_migrations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: django_session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.django_session (
    session_key character varying(40) NOT NULL,
    session_data text NOT NULL,
    expire_date timestamp with time zone NOT NULL
);


ALTER TABLE public.django_session OWNER TO postgres;

--
-- Name: djangosaml2idp_persistentid; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.djangosaml2idp_persistentid (
    id bigint NOT NULL,
    persistent_id uuid NOT NULL,
    created timestamp with time zone NOT NULL,
    sp_id bigint NOT NULL,
    user_id bigint NOT NULL
);


ALTER TABLE public.djangosaml2idp_persistentid OWNER TO postgres;

--
-- Name: djangosaml2idp_persistentid_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.djangosaml2idp_persistentid ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.djangosaml2idp_persistentid_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: djangosaml2idp_serviceprovider; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.djangosaml2idp_serviceprovider (
    id bigint NOT NULL,
    dt_created timestamp with time zone NOT NULL,
    dt_updated timestamp with time zone,
    entity_id character varying(255) NOT NULL,
    pretty_name character varying(255) NOT NULL,
    description text NOT NULL,
    metadata_expiration_dt timestamp with time zone NOT NULL,
    remote_metadata_url character varying(512) NOT NULL,
    local_metadata text NOT NULL,
    active boolean NOT NULL,
    _processor character varying(256) NOT NULL,
    _attribute_mapping text NOT NULL,
    _nameid_field character varying(64) NOT NULL,
    _sign_response boolean,
    _sign_assertion boolean,
    _signing_algorithm character varying(256),
    _digest_algorithm character varying(256),
    _encrypt_saml_responses boolean
);


ALTER TABLE public.djangosaml2idp_serviceprovider OWNER TO postgres;

--
-- Name: djangosaml2idp_serviceprovider_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.djangosaml2idp_serviceprovider ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.djangosaml2idp_serviceprovider_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: downtime_downtimepage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.downtime_downtimepage (
    id bigint NOT NULL,
    start timestamp with time zone NOT NULL,
    "end" timestamp with time zone NOT NULL,
    is_deleted boolean NOT NULL,
    message_templates jsonb NOT NULL,
    messages_by_language jsonb,
    messages jsonb NOT NULL
);


ALTER TABLE public.downtime_downtimepage OWNER TO postgres;

--
-- Name: downtime_downtimepage_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.downtime_downtimepage ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.downtime_downtimepage_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: feed_sync_watermark; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.feed_sync_watermark (
    id bigint NOT NULL,
    content_type character varying(50) NOT NULL,
    last_synced_at timestamp with time zone NOT NULL
);


ALTER TABLE public.feed_sync_watermark OWNER TO postgres;

--
-- Name: feed_sync_watermark_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.feed_sync_watermark ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.feed_sync_watermark_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: files_directory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.files_directory (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone,
    client_id bigint,
    created_by_id bigint,
    parent_directory_id bigint,
    updated_by_id bigint
);


ALTER TABLE public.files_directory OWNER TO postgres;

--
-- Name: files_directory_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.files_directory ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.files_directory_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: files_file; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.files_file (
    id bigint NOT NULL,
    file character varying(2048) NOT NULL,
    file_name character varying(255) NOT NULL,
    file_size integer NOT NULL,
    is_shared boolean NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone,
    client_id bigint,
    created_by_id bigint,
    parent_directory_id bigint,
    updated_by_id bigint,
    CONSTRAINT files_file_file_size_check CHECK ((file_size >= 0))
);


ALTER TABLE public.files_file OWNER TO postgres;

--
-- Name: files_file_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.files_file ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.files_file_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: health_check_db_testmodel; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.health_check_db_testmodel (
    id integer NOT NULL,
    title character varying(128) NOT NULL
);


ALTER TABLE public.health_check_db_testmodel OWNER TO postgres;

--
-- Name: health_check_db_testmodel_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.health_check_db_testmodel ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.health_check_db_testmodel_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: industry_industry_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.clients_industry ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.industry_industry_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: mdl_client_custom_field_values; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mdl_client_custom_field_values (
    id bigint NOT NULL,
    created_date timestamp with time zone NOT NULL,
    modified_date timestamp with time zone NOT NULL,
    created_by integer,
    modified_by integer,
    client_id integer NOT NULL,
    name character varying(500),
    custom_field_id bigint NOT NULL,
    is_active boolean NOT NULL,
    ucms_id integer,
    last_sync_time timestamp with time zone
);


ALTER TABLE public.mdl_client_custom_field_values OWNER TO postgres;

--
-- Name: mdl_client_custom_field_values_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.mdl_client_custom_field_values ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.mdl_client_custom_field_values_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: mdl_client_custom_fields; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mdl_client_custom_fields (
    id bigint NOT NULL,
    created_date timestamp with time zone NOT NULL,
    modified_date timestamp with time zone NOT NULL,
    created_by integer,
    modified_by integer,
    client_id integer NOT NULL,
    name character varying(500),
    is_active boolean DEFAULT true NOT NULL,
    discriminator text NOT NULL,
    ucms_id integer,
    is_archived boolean NOT NULL,
    field_type character varying(100),
    required boolean NOT NULL,
    last_sync_time timestamp with time zone
);


ALTER TABLE public.mdl_client_custom_fields OWNER TO postgres;

--
-- Name: mdl_client_custom_fields_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.mdl_client_custom_fields ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.mdl_client_custom_fields_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: mdl_client_modules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mdl_client_modules (
    id uuid NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    created_by character varying(255),
    modified_by character varying(256),
    title text NOT NULL,
    module_key text NOT NULL,
    is_active boolean NOT NULL,
    display_order integer NOT NULL,
    is_enabled_by_default boolean NOT NULL,
    is_enabled_for_brand boolean NOT NULL,
    parent_id uuid
);


ALTER TABLE public.mdl_client_modules OWNER TO postgres;

--
-- Name: mdl_client_modules_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mdl_client_modules_config (
    id uuid NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    client_key integer NOT NULL,
    is_active boolean NOT NULL,
    created_by integer,
    modified_by integer,
    client_module_id uuid NOT NULL
);


ALTER TABLE public.mdl_client_modules_config OWNER TO postgres;

--
-- Name: mdl_country_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.clients_country ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.mdl_country_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: mdl_language_fonts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mdl_language_fonts (
    id uuid NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    created_by character varying(255),
    modified_by character varying(256),
    name text NOT NULL,
    class_name text NOT NULL,
    font_file bytea NOT NULL,
    font_file_name text,
    is_active boolean NOT NULL
);


ALTER TABLE public.mdl_language_fonts OWNER TO postgres;

--
-- Name: mdl_participant; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mdl_participant (
    id integer NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    created_by integer,
    modified_by integer,
    client_id integer NOT NULL,
    first_name text,
    last_name text,
    full_name text,
    clean_full_name text,
    middle_name text,
    email text,
    secondary_email text,
    work_email text,
    ssn text,
    spouse text,
    employee_id text,
    identifier text NOT NULL,
    is_active boolean NOT NULL,
    is_transfer boolean NOT NULL,
    is_deleted boolean NOT NULL,
    smart_phone integer,
    job_role integer,
    gender_id integer,
    country_id integer,
    location_id integer,
    dob timestamp with time zone,
    transfer_date timestamp with time zone,
    deleted_date timestamp with time zone,
    worker_last_date timestamp with time zone,
    worker_start_date timestamp with time zone,
    phone_number text,
    clean_number text,
    extension text
);


ALTER TABLE public.mdl_participant OWNER TO postgres;

--
-- Name: mdl_participant_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.mdl_participant ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.mdl_participant_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: mdl_participant_image; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mdl_participant_image (
    key_vale uuid NOT NULL,
    id integer NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    created_by integer,
    modified_by integer,
    client_id integer NOT NULL,
    img_content bytea,
    identifier text NOT NULL
);


ALTER TABLE public.mdl_participant_image OWNER TO postgres;

--
-- Name: mdl_participant_image_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.mdl_participant_image ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.mdl_participant_image_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: mdl_participants_phone; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mdl_participants_phone (
    id integer NOT NULL,
    client_id integer NOT NULL,
    identifier text NOT NULL,
    phone_type integer,
    is_primary boolean,
    is_messages boolean,
    is_text boolean,
    number text,
    clean_number text,
    extension text,
    country_code text
);


ALTER TABLE public.mdl_participants_phone OWNER TO postgres;

--
-- Name: mdl_participants_phone_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.mdl_participants_phone ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.mdl_participants_phone_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: mdl_survey_option_bank; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mdl_survey_option_bank (
    id uuid NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    created_by character varying(255),
    modified_by character varying(256),
    client_id integer NOT NULL,
    title text NOT NULL,
    question_type integer NOT NULL,
    is_active boolean NOT NULL,
    is_emoji_enabled boolean NOT NULL
);


ALTER TABLE public.mdl_survey_option_bank OWNER TO postgres;

--
-- Name: mdl_survey_option_bank_option_translations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mdl_survey_option_bank_option_translations (
    id uuid NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    created_by character varying(255),
    modified_by character varying(256),
    client_id integer NOT NULL,
    translation text NOT NULL,
    language_id bigint
);


ALTER TABLE public.mdl_survey_option_bank_option_translations OWNER TO postgres;

--
-- Name: mdl_survey_option_bank_options; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mdl_survey_option_bank_options (
    id bigint NOT NULL,
    mdlsurveyoptionbank_id uuid NOT NULL,
    mdlsurveyoptionbankoptions_id uuid NOT NULL
);


ALTER TABLE public.mdl_survey_option_bank_options OWNER TO postgres;

--
-- Name: mdl_survey_option_bank_options_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.mdl_survey_option_bank_options ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.mdl_survey_option_bank_options_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: mdl_survey_option_bank_optionss; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mdl_survey_option_bank_optionss (
    id uuid NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    label text NOT NULL,
    weight text NOT NULL,
    is_cna boolean NOT NULL,
    icon_class text NOT NULL
);


ALTER TABLE public.mdl_survey_option_bank_optionss OWNER TO postgres;

--
-- Name: mdl_survey_option_bank_optionss_option_translations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mdl_survey_option_bank_optionss_option_translations (
    id bigint NOT NULL,
    mdlsurveyoptionbankoptions_id uuid NOT NULL,
    mdlsurveyoptionbankoptiontranslations_id uuid NOT NULL
);


ALTER TABLE public.mdl_survey_option_bank_optionss_option_translations OWNER TO postgres;

--
-- Name: mdl_survey_option_bank_optionss_option_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.mdl_survey_option_bank_optionss_option_translations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.mdl_survey_option_bank_optionss_option_translations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: mdl_survey_option_bank_title_translations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mdl_survey_option_bank_title_translations (
    id bigint NOT NULL,
    mdlsurveyoptionbank_id uuid NOT NULL,
    mdlsurveyoptionbanktranslations_id uuid NOT NULL
);


ALTER TABLE public.mdl_survey_option_bank_title_translations OWNER TO postgres;

--
-- Name: mdl_survey_option_bank_title_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.mdl_survey_option_bank_title_translations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.mdl_survey_option_bank_title_translations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: mdl_survey_option_bank_translations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mdl_survey_option_bank_translations (
    id uuid NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    created_by character varying(255),
    modified_by character varying(256),
    client_id integer NOT NULL,
    translation text NOT NULL,
    language_id bigint
);


ALTER TABLE public.mdl_survey_option_bank_translations OWNER TO postgres;

--
-- Name: mdl_wc_attachment_task; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mdl_wc_attachment_task (
    id integer NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    status integer NOT NULL
);


ALTER TABLE public.mdl_wc_attachment_task OWNER TO postgres;

--
-- Name: mdl_wc_attachment_task_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.mdl_wc_attachment_task ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.mdl_wc_attachment_task_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: mdl_wc_contact_attachment_content; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mdl_wc_contact_attachment_content (
    id integer NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    source_content bytea NOT NULL,
    result_content bytea NOT NULL
);


ALTER TABLE public.mdl_wc_contact_attachment_content OWNER TO postgres;

--
-- Name: mdl_wc_contact_attachment_content_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.mdl_wc_contact_attachment_content ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.mdl_wc_contact_attachment_content_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: mdl_wc_contact_attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mdl_wc_contact_attachments (
    id integer NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    created_by integer,
    modified_by integer,
    client_id integer NOT NULL,
    file_name text,
    status integer,
    description text,
    source_id integer NOT NULL,
    user_name text,
    opt_start_date timestamp with time zone,
    opt_end_date timestamp with time zone,
    content_size text,
    total_count integer NOT NULL,
    processed_count integer NOT NULL,
    new_count integer NOT NULL,
    update_count integer NOT NULL,
    deactivate_count integer NOT NULL,
    failed_count integer NOT NULL,
    binary_content_id integer
);


ALTER TABLE public.mdl_wc_contact_attachments OWNER TO postgres;

--
-- Name: mdl_wc_contact_attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.mdl_wc_contact_attachments ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.mdl_wc_contact_attachments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: mdl_wc_contact_group_translations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mdl_wc_contact_group_translations (
    id integer NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    "Name" text NOT NULL,
    language_id bigint NOT NULL
);


ALTER TABLE public.mdl_wc_contact_group_translations OWNER TO postgres;

--
-- Name: mdl_wc_contact_group_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.mdl_wc_contact_group_translations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.mdl_wc_contact_group_translations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: mdl_wc_contact_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mdl_wc_contact_groups (
    id integer NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    created_by integer,
    modified_by integer,
    client_id integer NOT NULL,
    name text,
    description text,
    is_active boolean NOT NULL,
    is_system boolean NOT NULL,
    wovo_contact_id integer NOT NULL,
    is_default boolean NOT NULL
);


ALTER TABLE public.mdl_wc_contact_groups OWNER TO postgres;

--
-- Name: mdl_wc_contact_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.mdl_wc_contact_groups ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.mdl_wc_contact_groups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: mdl_wc_contact_groups_translations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mdl_wc_contact_groups_translations (
    id bigint NOT NULL,
    mdlwccontactgroup_id integer NOT NULL,
    mdlwccontactgrouptranslations_id integer NOT NULL
);


ALTER TABLE public.mdl_wc_contact_groups_translations OWNER TO postgres;

--
-- Name: mdl_wc_contact_groups_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.mdl_wc_contact_groups_translations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.mdl_wc_contact_groups_translations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: mdl_wc_participant_contact_group_relation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mdl_wc_participant_contact_group_relation (
    id integer NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    client_id integer NOT NULL,
    identifier text NOT NULL,
    contact_group_id integer NOT NULL
);


ALTER TABLE public.mdl_wc_participant_contact_group_relation OWNER TO postgres;

--
-- Name: mdl_wc_participant_contact_group_relation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.mdl_wc_participant_contact_group_relation ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.mdl_wc_participant_contact_group_relation_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: mdl_wc_participant_counter; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mdl_wc_participant_counter (
    id integer NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    code text NOT NULL,
    next_id bigint NOT NULL
);


ALTER TABLE public.mdl_wc_participant_counter OWNER TO postgres;

--
-- Name: mdl_wc_participant_counter_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.mdl_wc_participant_counter ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.mdl_wc_participant_counter_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: mdl_wc_participant_custom_field_relation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mdl_wc_participant_custom_field_relation (
    id bigint NOT NULL,
    created_date timestamp with time zone NOT NULL,
    modified_date timestamp with time zone NOT NULL,
    client_id bigint,
    identifier text NOT NULL,
    "Value" text NOT NULL,
    "IsArchived" boolean NOT NULL,
    custom_field_id bigint,
    custom_field_value_id bigint,
    last_sync_time timestamp with time zone,
    created_by integer,
    modified_by integer
);


ALTER TABLE public.mdl_wc_participant_custom_field_relation OWNER TO postgres;

--
-- Name: mdl_wc_participant_custom_field_relation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.mdl_wc_participant_custom_field_relation ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.mdl_wc_participant_custom_field_relation_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: notifications_appnotification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications_appnotification (
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    id integer NOT NULL,
    device_tokens jsonb,
    notification_type character varying(20) NOT NULL,
    status character varying(30) NOT NULL,
    status_msg character varying(512),
    client_id integer,
    content jsonb,
    success_count integer NOT NULL,
    failure_count integer NOT NULL,
    CONSTRAINT notifications_appnotification_failure_count_check CHECK ((failure_count >= 0)),
    CONSTRAINT notifications_appnotification_success_count_check CHECK ((success_count >= 0))
);


ALTER TABLE public.notifications_appnotification OWNER TO postgres;

--
-- Name: notifications_appnotification_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.notifications_appnotification ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.notifications_appnotification_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: notifications_smscredits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications_smscredits (
    id integer NOT NULL,
    alloted integer NOT NULL,
    used integer NOT NULL,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone,
    is_deleted boolean NOT NULL,
    created_by integer NOT NULL,
    created_date timestamp with time zone NOT NULL,
    modified_by integer NOT NULL,
    modified_date timestamp with time zone NOT NULL,
    client_id bigint NOT NULL
);


ALTER TABLE public.notifications_smscredits OWNER TO postgres;

--
-- Name: notifications_smscredits_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.notifications_smscredits ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.notifications_smscredits_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: participants_clientcustomfieldconfig; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.participants_clientcustomfieldconfig (
    id bigint NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    client_id integer NOT NULL,
    client_code character varying(128) NOT NULL,
    name character varying(256) NOT NULL,
    input_type character varying(256) NOT NULL,
    is_mandatory boolean NOT NULL,
    is_active boolean NOT NULL,
    is_editable boolean NOT NULL
);


ALTER TABLE public.participants_clientcustomfieldconfig OWNER TO postgres;

--
-- Name: participants_clientcustomfieldconfig_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.participants_clientcustomfieldconfig ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.participants_clientcustomfieldconfig_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: participants_clientfieldconfig; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.participants_clientfieldconfig (
    id bigint NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    client_id integer NOT NULL,
    client_code character varying(128) NOT NULL,
    is_mandatory boolean NOT NULL,
    field_id integer NOT NULL
);


ALTER TABLE public.participants_clientfieldconfig OWNER TO postgres;

--
-- Name: participants_clientfieldconfig_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.participants_clientfieldconfig ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.participants_clientfieldconfig_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: participants_participant; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.participants_participant (
    id bigint NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    client_id integer NOT NULL,
    client_code character varying(128) NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    emp_id text NOT NULL,
    dob timestamp with time zone NOT NULL,
    gender character varying(1) NOT NULL,
    country_code character varying(16) NOT NULL,
    phone character varying(16) NOT NULL,
    street_one text NOT NULL,
    street_two text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    zip_code text NOT NULL,
    country character varying(16) NOT NULL
);


ALTER TABLE public.participants_participant OWNER TO postgres;

--
-- Name: participants_participant_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.participants_participant_groups (
    id bigint NOT NULL,
    participant_id bigint NOT NULL,
    participantgroups_id bigint NOT NULL
);


ALTER TABLE public.participants_participant_groups OWNER TO postgres;

--
-- Name: participants_participant_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.participants_participant_groups ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.participants_participant_groups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: participants_participant_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.participants_participant ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.participants_participant_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: participants_participantfields; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.participants_participantfields (
    id bigint NOT NULL,
    name character varying(256) NOT NULL,
    input_type character varying(256) NOT NULL,
    is_editable boolean NOT NULL,
    key_value character varying(32) NOT NULL
);


ALTER TABLE public.participants_participantfields OWNER TO postgres;

--
-- Name: participants_participantfields_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.participants_participantfields ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.participants_participantfields_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: participants_participantgroups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.participants_participantgroups (
    id bigint NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    client_id integer NOT NULL,
    client_code character varying(128) NOT NULL,
    name character varying(256) NOT NULL,
    lang character varying(16) NOT NULL,
    is_active boolean NOT NULL,
    dic_key character varying(256) NOT NULL
);


ALTER TABLE public.participants_participantgroups OWNER TO postgres;

--
-- Name: participants_participantgroups_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.participants_participantgroups ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.participants_participantgroups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: payslip; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payslip (
    id bigint NOT NULL,
    uuid uuid NOT NULL,
    title character varying(255),
    description text,
    message text,
    scheduled_date timestamp with time zone NOT NULL,
    immediate boolean NOT NULL,
    status integer NOT NULL,
    client_id integer NOT NULL,
    recipient_email character varying(254) NOT NULL,
    channel integer NOT NULL,
    attachment_id integer,
    net_id integer,
    source integer NOT NULL,
    is_deleted boolean NOT NULL,
    created_date timestamp with time zone NOT NULL,
    modified_date timestamp with time zone NOT NULL,
    deleted_date timestamp with time zone,
    created_by integer NOT NULL,
    modified_by integer NOT NULL,
    deleted_by integer,
    uploaded_file_id bigint,
    task_id character varying(512)
);


ALTER TABLE public.payslip OWNER TO postgres;

--
-- Name: payslip_employee; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payslip_employee (
    id bigint NOT NULL,
    employee_id character varying(255) NOT NULL,
    identifier character varying(255) NOT NULL,
    phone_number character varying(255),
    device_token character varying(255),
    device_type integer,
    short_pdf_url character varying(255),
    payslip_details jsonb NOT NULL,
    sent_through integer,
    status integer NOT NULL,
    reason character varying(255),
    created_date timestamp with time zone NOT NULL,
    modified_date timestamp with time zone NOT NULL,
    created_by integer NOT NULL,
    modified_by integer NOT NULL,
    payslip_id bigint NOT NULL
);


ALTER TABLE public.payslip_employee OWNER TO postgres;

--
-- Name: payslip_employee_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.payslip_employee ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.payslip_employee_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: payslip_generated; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payslip_generated (
    id bigint NOT NULL,
    html text,
    pdf bytea,
    json_data jsonb NOT NULL,
    pdf_name character varying(255) NOT NULL,
    created_date timestamp with time zone NOT NULL,
    modified_date timestamp with time zone NOT NULL,
    created_by integer NOT NULL,
    modified_by integer NOT NULL,
    payslip_id bigint NOT NULL,
    payslip_employee_id bigint NOT NULL,
    html_url text,
    pdf_url text
);


ALTER TABLE public.payslip_generated OWNER TO postgres;

--
-- Name: payslip_generated_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.payslip_generated ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.payslip_generated_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: payslip_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.payslip ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.payslip_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: payslip_uploaded_file; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payslip_uploaded_file (
    id bigint NOT NULL,
    file bytea,
    name character varying(255) NOT NULL,
    breakdown jsonb NOT NULL,
    validated_data jsonb,
    verification_summary jsonb NOT NULL,
    delivery_summary jsonb,
    verification_file bytea,
    delivery_file bytea,
    delivery_start_date timestamp with time zone,
    delivery_end_date timestamp with time zone,
    created_date timestamp with time zone NOT NULL,
    modified_date timestamp with time zone NOT NULL,
    created_by integer NOT NULL,
    modified_by integer NOT NULL,
    delivery_file_url text,
    file_url text,
    verification_file_url text
);


ALTER TABLE public.payslip_uploaded_file OWNER TO postgres;

--
-- Name: payslip_uploaded_file_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.payslip_uploaded_file ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.payslip_uploaded_file_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: shared_files_directory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shared_files_directory (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone,
    client_id bigint,
    created_by_id bigint,
    parent_directory_id bigint,
    updated_by_id bigint
);


ALTER TABLE public.shared_files_directory OWNER TO postgres;

--
-- Name: shared_files_directory_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.shared_files_directory ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.shared_files_directory_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: shared_files_file; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shared_files_file (
    id bigint NOT NULL,
    file character varying(2048) NOT NULL,
    file_name character varying(255) NOT NULL,
    file_size integer NOT NULL,
    is_shared boolean NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted_at timestamp with time zone,
    client_id bigint NOT NULL,
    created_by_id bigint,
    parent_directory_id bigint,
    updated_by_id bigint,
    CONSTRAINT shared_files_file_file_size_check CHECK ((file_size >= 0))
);


ALTER TABLE public.shared_files_file OWNER TO postgres;

--
-- Name: shared_files_file_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.shared_files_file ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.shared_files_file_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: silk_profile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.silk_profile (
    id integer NOT NULL,
    name character varying(300) NOT NULL,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone,
    time_taken double precision,
    file_path character varying(300) NOT NULL,
    line_num integer,
    end_line_num integer,
    func_name character varying(300) NOT NULL,
    exception_raised boolean NOT NULL,
    dynamic boolean NOT NULL,
    request_id character varying(36)
);


ALTER TABLE public.silk_profile OWNER TO postgres;

--
-- Name: silk_profile_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.silk_profile ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.silk_profile_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: silk_profile_queries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.silk_profile_queries (
    id bigint NOT NULL,
    profile_id integer NOT NULL,
    sqlquery_id integer NOT NULL
);


ALTER TABLE public.silk_profile_queries OWNER TO postgres;

--
-- Name: silk_profile_queries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.silk_profile_queries ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.silk_profile_queries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: silk_request; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.silk_request (
    id character varying(36) NOT NULL,
    path character varying(190) NOT NULL,
    query_params text NOT NULL,
    raw_body text NOT NULL,
    body text NOT NULL,
    method character varying(10) NOT NULL,
    start_time timestamp with time zone NOT NULL,
    view_name character varying(190),
    end_time timestamp with time zone,
    time_taken double precision,
    encoded_headers text NOT NULL,
    meta_time double precision,
    meta_num_queries integer,
    meta_time_spent_queries double precision,
    pyprofile text NOT NULL,
    num_sql_queries integer NOT NULL,
    prof_file character varying(300) NOT NULL
);


ALTER TABLE public.silk_request OWNER TO postgres;

--
-- Name: silk_response; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.silk_response (
    id character varying(36) NOT NULL,
    status_code integer NOT NULL,
    raw_body text NOT NULL,
    body text NOT NULL,
    encoded_headers text NOT NULL,
    request_id character varying(36) NOT NULL
);


ALTER TABLE public.silk_response OWNER TO postgres;

--
-- Name: silk_sqlquery; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.silk_sqlquery (
    id integer NOT NULL,
    query text NOT NULL,
    start_time timestamp with time zone,
    end_time timestamp with time zone,
    time_taken double precision,
    traceback text NOT NULL,
    request_id character varying(36),
    identifier integer NOT NULL,
    analysis text
);


ALTER TABLE public.silk_sqlquery OWNER TO postgres;

--
-- Name: silk_sqlquery_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.silk_sqlquery ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.silk_sqlquery_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: supplier_risk_scores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.supplier_risk_scores (
    supplier_id character varying NOT NULL,
    risk_score integer DEFAULT 50,
    case_score integer DEFAULT 50,
    survey_score integer DEFAULT 50,
    training_score integer DEFAULT 50,
    engagement_score integer DEFAULT 50,
    last_updated timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    reasons jsonb DEFAULT '[]'::jsonb
);


ALTER TABLE public.supplier_risk_scores OWNER TO postgres;

--
-- Name: survey_mdlsurvey; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurvey (
    id uuid NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    created_by character varying(255),
    modified_by character varying(256),
    client_id integer NOT NULL,
    name text NOT NULL,
    from_date timestamp with time zone,
    to_date timestamp with time zone,
    status integer NOT NULL,
    source integer NOT NULL,
    source_id text,
    parent_id text,
    sequence_id integer NOT NULL,
    is_locked boolean NOT NULL,
    is_anonymous boolean NOT NULL,
    is_clients_disabled boolean NOT NULL,
    one_response_per_device boolean NOT NULL,
    is_randomize boolean NOT NULL,
    questionnaire_parent_id text,
    closing_message_id uuid,
    opening_message_id uuid
);


ALTER TABLE public.survey_mdlsurvey OWNER TO postgres;

--
-- Name: survey_mdlsurvey_active_languages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurvey_active_languages (
    id bigint NOT NULL,
    supportedlanguages_id bigint NOT NULL,
    survey_id uuid NOT NULL
);


ALTER TABLE public.survey_mdlsurvey_active_languages OWNER TO postgres;

--
-- Name: survey_mdlsurvey_active_languages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.survey_mdlsurvey_active_languages ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.survey_mdlsurvey_active_languages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: survey_mdlsurvey_posters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurvey_posters (
    id bigint NOT NULL,
    mdlsurvey_id uuid NOT NULL,
    mdlsurveyposters_id uuid NOT NULL
);


ALTER TABLE public.survey_mdlsurvey_posters OWNER TO postgres;

--
-- Name: survey_mdlsurvey_posters_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.survey_mdlsurvey_posters ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.survey_mdlsurvey_posters_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: survey_mdlsurvey_questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurvey_questions (
    id bigint NOT NULL,
    mdlsurvey_id uuid NOT NULL,
    mdlsurveyquestions_id uuid NOT NULL
);


ALTER TABLE public.survey_mdlsurvey_questions OWNER TO postgres;

--
-- Name: survey_mdlsurvey_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.survey_mdlsurvey_questions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.survey_mdlsurvey_questions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: survey_mdlsurvey_reporting_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurvey_reporting_categories (
    id bigint NOT NULL,
    mdlsurvey_id uuid NOT NULL,
    mdlsurveyreportingcategory_id uuid NOT NULL
);


ALTER TABLE public.survey_mdlsurvey_reporting_categories OWNER TO postgres;

--
-- Name: survey_mdlsurvey_reporting_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.survey_mdlsurvey_reporting_categories ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.survey_mdlsurvey_reporting_categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: survey_mdlsurvey_shared_clients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurvey_shared_clients (
    id bigint NOT NULL,
    mdlsurvey_id uuid NOT NULL,
    clientinfo_id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL,
    from_date timestamp with time zone,
    modified_at timestamp with time zone NOT NULL,
    to_date timestamp with time zone,
    status integer NOT NULL,
    modified_by integer
);


ALTER TABLE public.survey_mdlsurvey_shared_clients OWNER TO postgres;

--
-- Name: survey_mdlsurvey_shared_clients_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.survey_mdlsurvey_shared_clients ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.survey_mdlsurvey_shared_clients_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: survey_mdlsurvey_supported_languages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurvey_supported_languages (
    id bigint NOT NULL,
    mdlsurvey_id uuid NOT NULL,
    mdlsupportedlanguages_id bigint NOT NULL
);


ALTER TABLE public.survey_mdlsurvey_supported_languages OWNER TO postgres;

--
-- Name: survey_mdlsurvey_supported_languages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.survey_mdlsurvey_supported_languages ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.survey_mdlsurvey_supported_languages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: survey_mdlsurvey_template_supported_languages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurvey_template_supported_languages (
    id bigint NOT NULL,
    mdltemplate_supported_languages_id bigint NOT NULL,
    mdlsurvey_id uuid NOT NULL
);


ALTER TABLE public.survey_mdlsurvey_template_supported_languages OWNER TO postgres;

--
-- Name: survey_mdlsurvey_template_supported_languages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.survey_mdlsurvey_template_supported_languages ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.survey_mdlsurvey_template_supported_languages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: survey_mdlsurvey_translations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurvey_translations (
    id bigint NOT NULL,
    mdlsurvey_id uuid NOT NULL,
    mdlsurveytitletranslations_id uuid NOT NULL
);


ALTER TABLE public.survey_mdlsurvey_translations OWNER TO postgres;

--
-- Name: survey_mdlsurvey_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.survey_mdlsurvey_translations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.survey_mdlsurvey_translations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: survey_mdlsurveyclientquestiontemplateconfig; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveyclientquestiontemplateconfig (
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    id uuid NOT NULL,
    created_by character varying(255),
    modified_by character varying(256),
    question_id uuid
);


ALTER TABLE public.survey_mdlsurveyclientquestiontemplateconfig OWNER TO postgres;

--
-- Name: survey_mdlsurveyclientquestiontemplateconfig_client_id; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveyclientquestiontemplateconfig_client_id (
    id bigint NOT NULL,
    mdlsurveyclientquestiontemplateconfig_id uuid NOT NULL,
    clientinfo_id bigint NOT NULL
);


ALTER TABLE public.survey_mdlsurveyclientquestiontemplateconfig_client_id OWNER TO postgres;

--
-- Name: survey_mdlsurveyclientquestiontemplateconfig_client_id_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.survey_mdlsurveyclientquestiontemplateconfig_client_id ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.survey_mdlsurveyclientquestiontemplateconfig_client_id_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: survey_mdlsurveyclosingmessage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveyclosingmessage (
    id uuid NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    created_by character varying(255),
    modified_by character varying(256),
    client_id integer NOT NULL,
    message text NOT NULL,
    url text NOT NULL
);


ALTER TABLE public.survey_mdlsurveyclosingmessage OWNER TO postgres;

--
-- Name: survey_mdlsurveyclosingmessage_translation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveyclosingmessage_translation (
    id bigint NOT NULL,
    mdlsurveyclosingmessage_id uuid NOT NULL,
    mdlsurveyclosingmessagetranslations_id uuid NOT NULL
);


ALTER TABLE public.survey_mdlsurveyclosingmessage_translation OWNER TO postgres;

--
-- Name: survey_mdlsurveyclosingmessage_translation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.survey_mdlsurveyclosingmessage_translation ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.survey_mdlsurveyclosingmessage_translation_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: survey_mdlsurveyclosingmessagetranslations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveyclosingmessagetranslations (
    id uuid NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    created_by character varying(255),
    modified_by character varying(256),
    client_id integer NOT NULL,
    translation text NOT NULL,
    language_id bigint NOT NULL
);


ALTER TABLE public.survey_mdlsurveyclosingmessagetranslations OWNER TO postgres;

--
-- Name: survey_mdlsurveyopeningmessage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveyopeningmessage (
    id uuid NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    created_by character varying(255),
    modified_by character varying(256),
    client_id integer NOT NULL,
    message text NOT NULL,
    url text NOT NULL
);


ALTER TABLE public.survey_mdlsurveyopeningmessage OWNER TO postgres;

--
-- Name: survey_mdlsurveyopeningmessage_translation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveyopeningmessage_translation (
    id bigint NOT NULL,
    mdlsurveyopeningmessage_id uuid NOT NULL,
    mdlsurveyopeningmessagetranslations_id uuid NOT NULL
);


ALTER TABLE public.survey_mdlsurveyopeningmessage_translation OWNER TO postgres;

--
-- Name: survey_mdlsurveyopeningmessage_translation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.survey_mdlsurveyopeningmessage_translation ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.survey_mdlsurveyopeningmessage_translation_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: survey_mdlsurveyopeningmessagetranslations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveyopeningmessagetranslations (
    id uuid NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    created_by character varying(255),
    modified_by character varying(256),
    client_id integer NOT NULL,
    translation text NOT NULL,
    language_id bigint NOT NULL
);


ALTER TABLE public.survey_mdlsurveyopeningmessagetranslations OWNER TO postgres;

--
-- Name: survey_mdlsurveyposters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveyposters (
    id uuid NOT NULL,
    client_id integer NOT NULL,
    client_code character varying(128) NOT NULL,
    type integer NOT NULL,
    img character varying(100) NOT NULL
);


ALTER TABLE public.survey_mdlsurveyposters OWNER TO postgres;

--
-- Name: survey_mdlsurveyquestioncategory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveyquestioncategory (
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    id uuid NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    dic_key text NOT NULL,
    dic_key_desc text NOT NULL,
    is_active boolean NOT NULL,
    created_by character varying(255),
    modified_by character varying(256)
);


ALTER TABLE public.survey_mdlsurveyquestioncategory OWNER TO postgres;

--
-- Name: survey_mdlsurveyquestioncategory_client_id; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveyquestioncategory_client_id (
    id bigint NOT NULL,
    mdlsurveyquestioncategory_id uuid NOT NULL,
    clientinfo_id bigint NOT NULL
);


ALTER TABLE public.survey_mdlsurveyquestioncategory_client_id OWNER TO postgres;

--
-- Name: survey_mdlsurveyquestioncategory_client_id_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.survey_mdlsurveyquestioncategory_client_id ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.survey_mdlsurveyquestioncategory_client_id_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: survey_mdlsurveyquestionoptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveyquestionoptions (
    id uuid NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    created_by character varying(255),
    modified_by character varying(256),
    client_id integer NOT NULL,
    label text NOT NULL,
    weight text NOT NULL,
    is_cna boolean NOT NULL,
    source_id text,
    icon_class text NOT NULL
);


ALTER TABLE public.survey_mdlsurveyquestionoptions OWNER TO postgres;

--
-- Name: survey_mdlsurveyquestionoptions_option_translations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveyquestionoptions_option_translations (
    id bigint NOT NULL,
    mdlsurveyquestionoptions_id uuid NOT NULL,
    mdlsurveyquestionoptiontranslations_id uuid NOT NULL
);


ALTER TABLE public.survey_mdlsurveyquestionoptions_option_translations OWNER TO postgres;

--
-- Name: survey_mdlsurveyquestionoptions_option_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.survey_mdlsurveyquestionoptions_option_translations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.survey_mdlsurveyquestionoptions_option_translations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: survey_mdlsurveyquestionoptionsmedia; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveyquestionoptionsmedia (
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    id uuid NOT NULL,
    media bytea NOT NULL,
    created_by character varying(255),
    modified_by character varying(256),
    question_id uuid
);


ALTER TABLE public.survey_mdlsurveyquestionoptionsmedia OWNER TO postgres;

--
-- Name: survey_mdlsurveyquestionoptionsmedia_client_id; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveyquestionoptionsmedia_client_id (
    id bigint NOT NULL,
    mdlsurveyquestionoptionsmedia_id uuid NOT NULL,
    clientinfo_id bigint NOT NULL
);


ALTER TABLE public.survey_mdlsurveyquestionoptionsmedia_client_id OWNER TO postgres;

--
-- Name: survey_mdlsurveyquestionoptionsmedia_client_id_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.survey_mdlsurveyquestionoptionsmedia_client_id ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.survey_mdlsurveyquestionoptionsmedia_client_id_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: survey_mdlsurveyquestionoptiontranslations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveyquestionoptiontranslations (
    id uuid NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    created_by character varying(255),
    modified_by character varying(256),
    client_id integer NOT NULL,
    option_translation text NOT NULL,
    language_id bigint NOT NULL
);


ALTER TABLE public.survey_mdlsurveyquestionoptiontranslations OWNER TO postgres;

--
-- Name: survey_mdlsurveyquestionresponses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveyquestionresponses (
    id uuid NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    created_by character varying(255),
    modified_by character varying(256),
    client_id integer NOT NULL,
    text_response text NOT NULL,
    language_id bigint,
    question_option_id uuid,
    survey_id uuid,
    survey_question_id uuid,
    survey_user_response_id uuid
);


ALTER TABLE public.survey_mdlsurveyquestionresponses OWNER TO postgres;

--
-- Name: survey_mdlsurveyquestions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveyquestions (
    id uuid NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    created_by character varying(255),
    modified_by character varying(256),
    client_id integer NOT NULL,
    title text NOT NULL,
    is_locked boolean,
    is_active boolean,
    is_deleted boolean,
    is_accessible boolean,
    is_mandatory boolean,
    source_id text,
    question_parent_id text,
    is_emoji_enabled boolean NOT NULL,
    sequence_id integer,
    parent_type integer,
    parent_id character varying(200),
    questionnaire_question_id text,
    q_type_id uuid
);


ALTER TABLE public.survey_mdlsurveyquestions OWNER TO postgres;

--
-- Name: survey_mdlsurveyquestions_question_options; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveyquestions_question_options (
    id bigint NOT NULL,
    mdlsurveyquestions_id uuid NOT NULL,
    mdlsurveyquestionoptions_id uuid NOT NULL
);


ALTER TABLE public.survey_mdlsurveyquestions_question_options OWNER TO postgres;

--
-- Name: survey_mdlsurveyquestions_question_options_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.survey_mdlsurveyquestions_question_options ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.survey_mdlsurveyquestions_question_options_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: survey_mdlsurveyquestions_reporting_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveyquestions_reporting_categories (
    id bigint NOT NULL,
    mdlsurveyquestions_id uuid NOT NULL,
    mdlsurveyreportingcategory_id uuid NOT NULL
);


ALTER TABLE public.survey_mdlsurveyquestions_reporting_categories OWNER TO postgres;

--
-- Name: survey_mdlsurveyquestions_reporting_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.survey_mdlsurveyquestions_reporting_categories ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.survey_mdlsurveyquestions_reporting_categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: survey_mdlsurveyquestions_translations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveyquestions_translations (
    id bigint NOT NULL,
    mdlsurveyquestions_id uuid NOT NULL,
    mdlsurveyquestiontranslations_id uuid NOT NULL
);


ALTER TABLE public.survey_mdlsurveyquestions_translations OWNER TO postgres;

--
-- Name: survey_mdlsurveyquestions_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.survey_mdlsurveyquestions_translations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.survey_mdlsurveyquestions_translations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: survey_mdlsurveyquestiontemplate; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveyquestiontemplate (
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    id uuid NOT NULL,
    title text NOT NULL,
    locked boolean NOT NULL,
    is_active boolean NOT NULL,
    deleted boolean,
    accessible boolean NOT NULL,
    created_by character varying(255),
    modified_by character varying(256),
    category_id uuid,
    q_type_id uuid
);


ALTER TABLE public.survey_mdlsurveyquestiontemplate OWNER TO postgres;

--
-- Name: survey_mdlsurveyquestiontemplate_client_id; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveyquestiontemplate_client_id (
    id bigint NOT NULL,
    mdlsurveyquestiontemplate_id uuid NOT NULL,
    clientinfo_id bigint NOT NULL
);


ALTER TABLE public.survey_mdlsurveyquestiontemplate_client_id OWNER TO postgres;

--
-- Name: survey_mdlsurveyquestiontemplate_client_id_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.survey_mdlsurveyquestiontemplate_client_id ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.survey_mdlsurveyquestiontemplate_client_id_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: survey_mdlsurveyquestiontemplatemedia; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveyquestiontemplatemedia (
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    id uuid NOT NULL,
    media bytea NOT NULL,
    created_by character varying(255),
    modified_by character varying(256),
    question_id uuid
);


ALTER TABLE public.survey_mdlsurveyquestiontemplatemedia OWNER TO postgres;

--
-- Name: survey_mdlsurveyquestiontemplatemedia_client_id; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveyquestiontemplatemedia_client_id (
    id bigint NOT NULL,
    mdlsurveyquestiontemplatemedia_id uuid NOT NULL,
    clientinfo_id bigint NOT NULL
);


ALTER TABLE public.survey_mdlsurveyquestiontemplatemedia_client_id OWNER TO postgres;

--
-- Name: survey_mdlsurveyquestiontemplatemedia_client_id_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.survey_mdlsurveyquestiontemplatemedia_client_id ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.survey_mdlsurveyquestiontemplatemedia_client_id_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: survey_mdlsurveyquestiontemplatetranslations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveyquestiontemplatetranslations (
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    id uuid NOT NULL,
    language text NOT NULL,
    translation text NOT NULL,
    created_by character varying(255),
    modified_by character varying(256),
    question_id uuid
);


ALTER TABLE public.survey_mdlsurveyquestiontemplatetranslations OWNER TO postgres;

--
-- Name: survey_mdlsurveyquestiontemplatetranslations_client_id; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveyquestiontemplatetranslations_client_id (
    id bigint NOT NULL,
    mdlsurveyquestiontemplatetranslations_id uuid NOT NULL,
    clientinfo_id bigint NOT NULL
);


ALTER TABLE public.survey_mdlsurveyquestiontemplatetranslations_client_id OWNER TO postgres;

--
-- Name: survey_mdlsurveyquestiontemplatetranslations_client_id_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.survey_mdlsurveyquestiontemplatetranslations_client_id ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.survey_mdlsurveyquestiontemplatetranslations_client_id_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: survey_mdlsurveyquestiontemplatetypeconfig; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveyquestiontemplatetypeconfig (
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    id uuid NOT NULL,
    is_single_select boolean NOT NULL,
    name text NOT NULL,
    weight integer NOT NULL,
    created_by character varying(255),
    modified_by character varying(256),
    question_id uuid
);


ALTER TABLE public.survey_mdlsurveyquestiontemplatetypeconfig OWNER TO postgres;

--
-- Name: survey_mdlsurveyquestiontemplatetypeconfig_client_id; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveyquestiontemplatetypeconfig_client_id (
    id bigint NOT NULL,
    mdlsurveyquestiontemplatetypeconfig_id uuid NOT NULL,
    clientinfo_id bigint NOT NULL
);


ALTER TABLE public.survey_mdlsurveyquestiontemplatetypeconfig_client_id OWNER TO postgres;

--
-- Name: survey_mdlsurveyquestiontemplatetypeconfig_client_id_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.survey_mdlsurveyquestiontemplatetypeconfig_client_id ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.survey_mdlsurveyquestiontemplatetypeconfig_client_id_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: survey_mdlsurveyquestiontranslations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveyquestiontranslations (
    id uuid NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    created_by character varying(255),
    modified_by character varying(256),
    client_id integer NOT NULL,
    translation text NOT NULL,
    language_id bigint NOT NULL
);


ALTER TABLE public.survey_mdlsurveyquestiontranslations OWNER TO postgres;

--
-- Name: survey_mdlsurveyquestiontype; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveyquestiontype (
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    id uuid NOT NULL,
    name text NOT NULL,
    question_type integer NOT NULL,
    is_active boolean NOT NULL,
    dic_key text NOT NULL,
    created_by character varying(255),
    modified_by character varying(256)
);


ALTER TABLE public.survey_mdlsurveyquestiontype OWNER TO postgres;

--
-- Name: survey_mdlsurveyquestiontypeoptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveyquestiontypeoptions (
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    id uuid NOT NULL,
    name text NOT NULL,
    value integer NOT NULL,
    created_by character varying(255),
    modified_by character varying(256),
    type_id uuid NOT NULL
);


ALTER TABLE public.survey_mdlsurveyquestiontypeoptions OWNER TO postgres;

--
-- Name: survey_mdlsurveyreportingcategory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveyreportingcategory (
    id uuid NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    created_by character varying(255),
    modified_by character varying(256),
    client_id integer NOT NULL,
    title text NOT NULL,
    is_active boolean NOT NULL,
    category_id integer,
    is_global boolean NOT NULL
);


ALTER TABLE public.survey_mdlsurveyreportingcategory OWNER TO postgres;

--
-- Name: survey_mdlsurveyreportingcategory_supported_languages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveyreportingcategory_supported_languages (
    id bigint NOT NULL,
    mdlsurveyreportingcategory_id uuid NOT NULL,
    mdlsupportedlanguages_id bigint NOT NULL
);


ALTER TABLE public.survey_mdlsurveyreportingcategory_supported_languages OWNER TO postgres;

--
-- Name: survey_mdlsurveyreportingcategory_supported_languages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.survey_mdlsurveyreportingcategory_supported_languages ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.survey_mdlsurveyreportingcategory_supported_languages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: survey_mdlsurveyreportingcategory_translations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveyreportingcategory_translations (
    id bigint NOT NULL,
    mdlsurveyreportingcategory_id uuid NOT NULL,
    mdlsurveyreportingcategorytranslations_id uuid NOT NULL
);


ALTER TABLE public.survey_mdlsurveyreportingcategory_translations OWNER TO postgres;

--
-- Name: survey_mdlsurveyreportingcategory_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.survey_mdlsurveyreportingcategory_translations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.survey_mdlsurveyreportingcategory_translations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: survey_mdlsurveyreportingcategorytranslations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveyreportingcategorytranslations (
    id uuid NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    translation text NOT NULL,
    language_id bigint NOT NULL
);


ALTER TABLE public.survey_mdlsurveyreportingcategorytranslations OWNER TO postgres;

--
-- Name: survey_mdlsurveytemplate; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveytemplate (
    id uuid NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    created_by character varying(255),
    modified_by character varying(256),
    client_id integer NOT NULL,
    name text,
    from_date date,
    to_date date,
    status integer NOT NULL,
    source integer NOT NULL,
    source_id text,
    is_locked boolean NOT NULL,
    is_anonymous boolean NOT NULL,
    is_clients_disabled boolean NOT NULL,
    one_response_per_device boolean NOT NULL,
    sequence_id integer,
    parent_type integer,
    parent_id character varying(200)
);


ALTER TABLE public.survey_mdlsurveytemplate OWNER TO postgres;

--
-- Name: survey_mdlsurveytemplate_posters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveytemplate_posters (
    id bigint NOT NULL,
    mdlsurveytemplate_id uuid NOT NULL,
    mdlsurveytemplateposters_id uuid NOT NULL
);


ALTER TABLE public.survey_mdlsurveytemplate_posters OWNER TO postgres;

--
-- Name: survey_mdlsurveytemplate_posters_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.survey_mdlsurveytemplate_posters ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.survey_mdlsurveytemplate_posters_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: survey_mdlsurveytemplate_questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveytemplate_questions (
    id bigint NOT NULL,
    mdlsurveytemplate_id uuid NOT NULL,
    mdlsurveytemplatequestion_id uuid NOT NULL
);


ALTER TABLE public.survey_mdlsurveytemplate_questions OWNER TO postgres;

--
-- Name: survey_mdlsurveytemplate_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.survey_mdlsurveytemplate_questions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.survey_mdlsurveytemplate_questions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: survey_mdlsurveytemplate_reporting_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveytemplate_reporting_categories (
    id bigint NOT NULL,
    mdlsurveytemplate_id uuid NOT NULL,
    mdlsurveyreportingcategory_id uuid NOT NULL
);


ALTER TABLE public.survey_mdlsurveytemplate_reporting_categories OWNER TO postgres;

--
-- Name: survey_mdlsurveytemplate_reporting_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.survey_mdlsurveytemplate_reporting_categories ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.survey_mdlsurveytemplate_reporting_categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: survey_mdlsurveytemplate_shared_clients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveytemplate_shared_clients (
    id bigint NOT NULL,
    mdlsurveytemplate_id uuid NOT NULL,
    clientinfo_id bigint NOT NULL
);


ALTER TABLE public.survey_mdlsurveytemplate_shared_clients OWNER TO postgres;

--
-- Name: survey_mdlsurveytemplate_shared_clients_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.survey_mdlsurveytemplate_shared_clients ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.survey_mdlsurveytemplate_shared_clients_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: survey_mdlsurveytemplate_supported_languages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveytemplate_supported_languages (
    id bigint NOT NULL,
    mdlsurveytemplate_id uuid NOT NULL,
    mdlsupportedlanguages_id bigint NOT NULL
);


ALTER TABLE public.survey_mdlsurveytemplate_supported_languages OWNER TO postgres;

--
-- Name: survey_mdlsurveytemplate_supported_languages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.survey_mdlsurveytemplate_supported_languages ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.survey_mdlsurveytemplate_supported_languages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: survey_mdlsurveytemplate_translations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveytemplate_translations (
    id bigint NOT NULL,
    mdlsurveytemplate_id uuid NOT NULL,
    mdlsurveytemplatetranslations_id uuid NOT NULL
);


ALTER TABLE public.survey_mdlsurveytemplate_translations OWNER TO postgres;

--
-- Name: survey_mdlsurveytemplate_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.survey_mdlsurveytemplate_translations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.survey_mdlsurveytemplate_translations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: survey_mdlsurveytemplateposters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveytemplateposters (
    id uuid NOT NULL,
    client_id integer NOT NULL,
    client_code character varying(128) NOT NULL,
    type integer NOT NULL,
    logo character varying(100) NOT NULL
);


ALTER TABLE public.survey_mdlsurveytemplateposters OWNER TO postgres;

--
-- Name: survey_mdlsurveytemplatequestion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveytemplatequestion (
    id uuid NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    title text NOT NULL,
    is_locked boolean,
    is_active boolean,
    is_deleted boolean,
    is_accessible boolean,
    is_mandatory boolean,
    is_emoji_enabled boolean NOT NULL,
    sequence_id integer,
    parent_type integer,
    parent_id character varying(200),
    question_parent_id text,
    q_type_id uuid
);


ALTER TABLE public.survey_mdlsurveytemplatequestion OWNER TO postgres;

--
-- Name: survey_mdlsurveytemplatequestion_question_options; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveytemplatequestion_question_options (
    id bigint NOT NULL,
    mdlsurveytemplatequestion_id uuid NOT NULL,
    mdlsurveytemplatequestionoptions_id uuid NOT NULL
);


ALTER TABLE public.survey_mdlsurveytemplatequestion_question_options OWNER TO postgres;

--
-- Name: survey_mdlsurveytemplatequestion_question_options_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.survey_mdlsurveytemplatequestion_question_options ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.survey_mdlsurveytemplatequestion_question_options_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: survey_mdlsurveytemplatequestion_reporting_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveytemplatequestion_reporting_categories (
    id bigint NOT NULL,
    mdlsurveytemplatequestion_id uuid NOT NULL,
    mdlsurveyreportingcategory_id uuid NOT NULL
);


ALTER TABLE public.survey_mdlsurveytemplatequestion_reporting_categories OWNER TO postgres;

--
-- Name: survey_mdlsurveytemplatequestion_reporting_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.survey_mdlsurveytemplatequestion_reporting_categories ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.survey_mdlsurveytemplatequestion_reporting_categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: survey_mdlsurveytemplatequestion_translations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveytemplatequestion_translations (
    id bigint NOT NULL,
    mdlsurveytemplatequestion_id uuid NOT NULL,
    mdlsurveytemplatequestiontranslations_id uuid NOT NULL
);


ALTER TABLE public.survey_mdlsurveytemplatequestion_translations OWNER TO postgres;

--
-- Name: survey_mdlsurveytemplatequestion_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.survey_mdlsurveytemplatequestion_translations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.survey_mdlsurveytemplatequestion_translations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: survey_mdlsurveytemplatequestionoptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveytemplatequestionoptions (
    id uuid NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    label text NOT NULL,
    weight text NOT NULL,
    is_cna boolean NOT NULL,
    icon_class text NOT NULL
);


ALTER TABLE public.survey_mdlsurveytemplatequestionoptions OWNER TO postgres;

--
-- Name: survey_mdlsurveytemplatequestionoptions_option_translations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveytemplatequestionoptions_option_translations (
    id bigint NOT NULL,
    mdlsurveytemplatequestionoptions_id uuid NOT NULL,
    mdlsurveytemplatequestionoptionstranslations_id uuid NOT NULL
);


ALTER TABLE public.survey_mdlsurveytemplatequestionoptions_option_translations OWNER TO postgres;

--
-- Name: survey_mdlsurveytemplatequestionoptions_option_translati_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.survey_mdlsurveytemplatequestionoptions_option_translations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.survey_mdlsurveytemplatequestionoptions_option_translati_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: survey_mdlsurveytemplatequestionoptionstranslations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveytemplatequestionoptionstranslations (
    id uuid NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    created_by character varying(255),
    modified_by character varying(256),
    client_id integer NOT NULL,
    option_translation text NOT NULL,
    language_id bigint
);


ALTER TABLE public.survey_mdlsurveytemplatequestionoptionstranslations OWNER TO postgres;

--
-- Name: survey_mdlsurveytemplatequestiontranslations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveytemplatequestiontranslations (
    id uuid NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    created_by character varying(255),
    modified_by character varying(256),
    client_id integer NOT NULL,
    translation text NOT NULL,
    language_id bigint
);


ALTER TABLE public.survey_mdlsurveytemplatequestiontranslations OWNER TO postgres;

--
-- Name: survey_mdlsurveytemplatetranslations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveytemplatetranslations (
    id uuid NOT NULL,
    client_id integer NOT NULL,
    client_code character varying(128) NOT NULL,
    translation text NOT NULL,
    language_id bigint
);


ALTER TABLE public.survey_mdlsurveytemplatetranslations OWNER TO postgres;

--
-- Name: survey_mdlsurveytitletranslations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveytitletranslations (
    id uuid NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    created_by character varying(255),
    modified_by character varying(256),
    client_id integer NOT NULL,
    translation text NOT NULL,
    language_id bigint NOT NULL
);


ALTER TABLE public.survey_mdlsurveytitletranslations OWNER TO postgres;

--
-- Name: survey_mdlsurveyuserresponses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_mdlsurveyuserresponses (
    id uuid NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    created_by character varying(255),
    modified_by character varying(256),
    client_id integer NOT NULL,
    user_id integer NOT NULL,
    is_completed integer NOT NULL,
    request_id text,
    response_url text,
    response_type integer NOT NULL,
    response_source integer NOT NULL,
    randomise_status integer NOT NULL,
    country text NOT NULL,
    gender integer NOT NULL,
    age bigint NOT NULL,
    tenure bigint NOT NULL,
    age_label text NOT NULL,
    tenure_label text NOT NULL,
    identifier text NOT NULL,
    dept_id integer,
    dept_name text NOT NULL,
    smart_phone integer NOT NULL,
    job_role integer NOT NULL,
    language_id bigint NOT NULL,
    survey_id_id uuid NOT NULL,
    custom_demographics jsonb
);


ALTER TABLE public.survey_mdlsurveyuserresponses OWNER TO postgres;

--
-- Name: survey_surveyhistory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_surveyhistory (
    id bigint NOT NULL,
    modified_by integer,
    action integer NOT NULL,
    client_id integer,
    is_survey_level boolean NOT NULL,
    created_date timestamp with time zone NOT NULL,
    survey_id uuid NOT NULL,
    access_by integer
);


ALTER TABLE public.survey_surveyhistory OWNER TO postgres;

--
-- Name: survey_surveyhistory_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.survey_surveyhistory ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.survey_surveyhistory_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: survey_surveyinvite; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_surveyinvite (
    id uuid NOT NULL,
    client_id integer,
    status integer NOT NULL,
    message text,
    recipient_email character varying(254) NOT NULL,
    scheduled_date timestamp with time zone NOT NULL,
    immediate boolean NOT NULL,
    job_roles character varying(50)[],
    genders character varying(50)[],
    age_groups character varying(20)[],
    tenure_groups character varying(20)[],
    channels integer NOT NULL,
    outreach_summary jsonb,
    departments jsonb,
    created_date timestamp with time zone NOT NULL,
    modified_date timestamp with time zone NOT NULL,
    deleted_date timestamp with time zone,
    created_by integer NOT NULL,
    modified_by integer,
    deleted_by integer,
    is_deleted boolean NOT NULL,
    survey_id uuid NOT NULL,
    net_id integer,
    device_types character varying(50)[],
    groups jsonb,
    all_audiences boolean,
    process_start_date timestamp with time zone,
    process_end_date timestamp with time zone,
    survey_reminder_status integer,
    task_id character varying(512)
);


ALTER TABLE public.survey_surveyinvite OWNER TO postgres;

--
-- Name: survey_surveyinvitesworkers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_surveyinvitesworkers (
    id bigint NOT NULL,
    employee_id character varying(255) NOT NULL,
    identifier character varying(255) NOT NULL,
    phone_number character varying(255),
    device_token character varying(255),
    device_type integer,
    sent_through integer,
    status integer NOT NULL,
    sent_date date,
    reason character varying(255),
    client_id integer NOT NULL,
    created_date timestamp with time zone NOT NULL,
    modified_date timestamp with time zone NOT NULL,
    deleted_date timestamp with time zone,
    is_deleted boolean NOT NULL,
    survey_id uuid NOT NULL,
    survey_invite_id uuid NOT NULL,
    survey_short_url character varying(255),
    user_id integer
);


ALTER TABLE public.survey_surveyinvitesworkers OWNER TO postgres;

--
-- Name: survey_surveyinvitesworkers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.survey_surveyinvitesworkers ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.survey_surveyinvitesworkers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: survey_template_active_languages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.survey_template_active_languages (
    id bigint NOT NULL,
    supportedlanguages_id bigint NOT NULL,
    surveytemplate_id uuid NOT NULL
);


ALTER TABLE public.survey_template_active_languages OWNER TO postgres;

--
-- Name: survey_template_active_languages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.survey_template_active_languages ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.survey_template_active_languages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: translations_mdlsupportedlanguages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.translations_mdlsupportedlanguages (
    id bigint NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    name character varying(250) NOT NULL,
    language_code character varying(50) NOT NULL,
    is_active boolean NOT NULL,
    is_ui_language boolean NOT NULL,
    is_translated boolean NOT NULL,
    resource_version double precision NOT NULL,
    is_app_supported boolean NOT NULL,
    wovo_language_id integer NOT NULL,
    translation_key character varying(250)
);


ALTER TABLE public.translations_mdlsupportedlanguages OWNER TO postgres;

--
-- Name: translations_mdlsupportedlanguages_fonts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.translations_mdlsupportedlanguages_fonts (
    id bigint NOT NULL,
    mdlsupportedlanguages_id bigint NOT NULL,
    mdllanguagefonts_id uuid NOT NULL
);


ALTER TABLE public.translations_mdlsupportedlanguages_fonts OWNER TO postgres;

--
-- Name: translations_mdlsupportedlanguages_fonts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.translations_mdlsupportedlanguages_fonts ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.translations_mdlsupportedlanguages_fonts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: translations_mdlsupportedlanguages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.translations_mdlsupportedlanguages ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.translations_mdlsupportedlanguages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: translations_mdltranslationconfig; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.translations_mdltranslationconfig (
    id bigint NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    dic_key character varying(255) NOT NULL
);


ALTER TABLE public.translations_mdltranslationconfig OWNER TO postgres;

--
-- Name: translations_mdltranslationconfig_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.translations_mdltranslationconfig ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.translations_mdltranslationconfig_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: translations_mdltranslations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.translations_mdltranslations (
    id bigint NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    created_by character varying(255),
    modified_by character varying(256),
    translation text NOT NULL,
    dictionary_id bigint,
    language_id bigint
);


ALTER TABLE public.translations_mdltranslations OWNER TO postgres;

--
-- Name: translations_mdltranslations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.translations_mdltranslations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.translations_mdltranslations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: user_feed_cache; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_feed_cache (
    id bigint NOT NULL,
    participant_identifier character varying(255) NOT NULL,
    content_type character varying(50) NOT NULL,
    content_id integer NOT NULL,
    feed_date timestamp with time zone NOT NULL,
    data jsonb NOT NULL,
    cached_at timestamp with time zone NOT NULL
);


ALTER TABLE public.user_feed_cache OWNER TO postgres;

--
-- Name: user_feed_cache_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.user_feed_cache ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.user_feed_cache_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: user_roles_mdluseraccessmodule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles_mdluseraccessmodule (
    id bigint NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    name text NOT NULL,
    is_active boolean NOT NULL,
    modified_by integer,
    created_by integer,
    parent_id bigint
);


ALTER TABLE public.user_roles_mdluseraccessmodule OWNER TO postgres;

--
-- Name: user_roles_mdluseraccessmodule_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.user_roles_mdluseraccessmodule ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.user_roles_mdluseraccessmodule_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: user_roles_mdluseraccessrole; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles_mdluseraccessrole (
    id bigint NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    name text NOT NULL,
    is_active boolean NOT NULL,
    modified_by integer,
    created_by integer,
    parent_id bigint
);


ALTER TABLE public.user_roles_mdluseraccessrole OWNER TO postgres;

--
-- Name: user_roles_mdluseraccessrole_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.user_roles_mdluseraccessrole ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.user_roles_mdluseraccessrole_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: user_roles_mdluseraccessrolemoduleconfig; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles_mdluseraccessrolemoduleconfig (
    id bigint NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    modified_by integer,
    created_by integer,
    module_id_id bigint,
    role_id_id bigint
);


ALTER TABLE public.user_roles_mdluseraccessrolemoduleconfig OWNER TO postgres;

--
-- Name: user_roles_mdluseraccessrolemoduleconfig_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.user_roles_mdluseraccessrolemoduleconfig ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.user_roles_mdluseraccessrolemoduleconfig_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: user_roles_mdluseraccessuserroleconfig; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles_mdluseraccessuserroleconfig (
    id bigint NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    user_id integer,
    modified_by integer,
    created_by integer,
    role_id_id bigint
);


ALTER TABLE public.user_roles_mdluseraccessuserroleconfig OWNER TO postgres;

--
-- Name: user_roles_mdluseraccessuserroleconfig_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.user_roles_mdluseraccessuserroleconfig ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.user_roles_mdluseraccessuserroleconfig_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: user_settings_mdlusersettings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_settings_mdlusersettings (
    id bigint NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    user_name text NOT NULL,
    preferred_client text NOT NULL,
    theme_colour text NOT NULL,
    profile_img character varying(100) NOT NULL,
    language_id bigint,
    preferred_font_id uuid
);


ALTER TABLE public.user_settings_mdlusersettings OWNER TO postgres;

--
-- Name: user_settings_mdlusersettings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.user_settings_mdlusersettings ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.user_settings_mdlusersettings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: worker_contact_resetcontactregistration; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.worker_contact_resetcontactregistration (
    id bigint NOT NULL,
    uuid uuid NOT NULL,
    client_id integer NOT NULL,
    status integer NOT NULL,
    summary jsonb,
    created_date timestamp with time zone NOT NULL,
    modified_date timestamp with time zone NOT NULL,
    deleted_date timestamp with time zone,
    created_by integer NOT NULL,
    modified_by integer NOT NULL,
    deleted_by integer,
    is_deleted boolean NOT NULL,
    uploaded_file_id bigint,
    task_id character varying(512)
);


ALTER TABLE public.worker_contact_resetcontactregistration OWNER TO postgres;

--
-- Name: worker_contact_resetcontactregistration_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.worker_contact_resetcontactregistration ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.worker_contact_resetcontactregistration_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: worker_contact_resetcontactregistrationfile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.worker_contact_resetcontactregistrationfile (
    id bigint NOT NULL,
    file bytea,
    name character varying(255) NOT NULL,
    size character varying(255) NOT NULL,
    validated_data jsonb,
    report_download_link text,
    original_file_link text
);


ALTER TABLE public.worker_contact_resetcontactregistrationfile OWNER TO postgres;

--
-- Name: worker_contact_resetcontactregistrationfile_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.worker_contact_resetcontactregistrationfile ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.worker_contact_resetcontactregistrationfile_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: wovo_import_mdlclientusers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wovo_import_mdlclientusers (
    id bigint NOT NULL,
    client_id bigint,
    user_id bigint NOT NULL
);


ALTER TABLE public.wovo_import_mdlclientusers OWNER TO postgres;

--
-- Name: wovo_import_mdlclientusers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.wovo_import_mdlclientusers ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.wovo_import_mdlclientusers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: wovo_import_mdluser_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wovo_import_mdluser_groups (
    id bigint NOT NULL,
    mdluser_id bigint NOT NULL,
    group_id integer NOT NULL
);


ALTER TABLE public.wovo_import_mdluser_groups OWNER TO postgres;

--
-- Name: wovo_import_mdluser_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.wovo_import_mdluser_groups ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.wovo_import_mdluser_groups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: wovo_import_mdluser_user_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wovo_import_mdluser_user_permissions (
    id bigint NOT NULL,
    mdluser_id bigint NOT NULL,
    permission_id integer NOT NULL
);


ALTER TABLE public.wovo_import_mdluser_user_permissions OWNER TO postgres;

--
-- Name: wovo_import_mdluser_user_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.wovo_import_mdluser_user_permissions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.wovo_import_mdluser_user_permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: wovo_login_adminusers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wovo_login_adminusers (
    mdluser_ptr_id bigint NOT NULL,
    phone_number text NOT NULL,
    culture_id integer,
    created_time timestamp with time zone NOT NULL
);


ALTER TABLE public.wovo_login_adminusers OWNER TO postgres;

--
-- Name: account_managers_mdlaccountmanagers_countries account_managers_mdlacco_mdlaccountmanagers_id_md_a3375769_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_managers_mdlaccountmanagers_countries
    ADD CONSTRAINT account_managers_mdlacco_mdlaccountmanagers_id_md_a3375769_uniq UNIQUE (mdlaccountmanagers_id, mdlaccountmanagerscountry_id);


--
-- Name: account_managers_mdlaccountmanagers_countries account_managers_mdlaccountmanagers_countries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_managers_mdlaccountmanagers_countries
    ADD CONSTRAINT account_managers_mdlaccountmanagers_countries_pkey PRIMARY KEY (id);


--
-- Name: account_managers_mdlaccountmanagers account_managers_mdlaccountmanagers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_managers_mdlaccountmanagers
    ADD CONSTRAINT account_managers_mdlaccountmanagers_pkey PRIMARY KEY (id);


--
-- Name: account_managers_mdlaccountmanagerscountry account_managers_mdlaccountmanagerscountry_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_managers_mdlaccountmanagerscountry
    ADD CONSTRAINT account_managers_mdlaccountmanagerscountry_pkey PRIMARY KEY (id);


--
-- Name: auth_group auth_group_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group
    ADD CONSTRAINT auth_group_name_key UNIQUE (name);


--
-- Name: auth_group_permissions auth_group_permissions_group_id_permission_id_0cd325b0_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_group_id_permission_id_0cd325b0_uniq UNIQUE (group_id, permission_id);


--
-- Name: auth_group_permissions auth_group_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_pkey PRIMARY KEY (id);


--
-- Name: auth_group auth_group_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group
    ADD CONSTRAINT auth_group_pkey PRIMARY KEY (id);


--
-- Name: auth_permission auth_permission_content_type_id_codename_01ab375a_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_content_type_id_codename_01ab375a_uniq UNIQUE (content_type_id, codename);


--
-- Name: auth_permission auth_permission_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_pkey PRIMARY KEY (id);


--
-- Name: authentication_avatar authentication_avatar_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_avatar
    ADD CONSTRAINT authentication_avatar_pkey PRIMARY KEY (id);


--
-- Name: authentication_contactinfo authentication_contactinfo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_contactinfo
    ADD CONSTRAINT authentication_contactinfo_pkey PRIMARY KEY (user_id);


--
-- Name: authentication_module authentication_module_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_module
    ADD CONSTRAINT authentication_module_pkey PRIMARY KEY (id);


--
-- Name: authentication_modulemappingfornet authentication_modulemappingfornet_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_modulemappingfornet
    ADD CONSTRAINT authentication_modulemappingfornet_pkey PRIMARY KEY (id);


--
-- Name: authentication_passwordtoken authentication_passwordtoken_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_passwordtoken
    ADD CONSTRAINT authentication_passwordtoken_pkey PRIMARY KEY (id);


--
-- Name: authentication_role authentication_role_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_role
    ADD CONSTRAINT authentication_role_pkey PRIMARY KEY (id);


--
-- Name: authentication_roleassociatedmodule authentication_roleassociatedmodule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_roleassociatedmodule
    ADD CONSTRAINT authentication_roleassociatedmodule_pkey PRIMARY KEY (id);


--
-- Name: authentication_secretquestion authentication_secretquestion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_secretquestion
    ADD CONSTRAINT authentication_secretquestion_pkey PRIMARY KEY (id);


--
-- Name: authentication_user_groups authentication_user_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_user_groups
    ADD CONSTRAINT authentication_user_groups_pkey PRIMARY KEY (id);


--
-- Name: authentication_user_groups authentication_user_groups_user_id_group_id_8af031ac_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_user_groups
    ADD CONSTRAINT authentication_user_groups_user_id_group_id_8af031ac_uniq UNIQUE (user_id, group_id);


--
-- Name: authentication_user authentication_user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_user
    ADD CONSTRAINT authentication_user_pkey PRIMARY KEY (id);


--
-- Name: authentication_user_user_permissions authentication_user_user_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_user_user_permissions
    ADD CONSTRAINT authentication_user_user_permissions_pkey PRIMARY KEY (id);


--
-- Name: authentication_user_user_permissions authentication_user_user_user_id_permission_id_ec51b09f_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_user_user_permissions
    ADD CONSTRAINT authentication_user_user_user_id_permission_id_ec51b09f_uniq UNIQUE (user_id, permission_id);


--
-- Name: authentication_user authentication_user_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_user
    ADD CONSTRAINT authentication_user_username_key UNIQUE (username);


--
-- Name: authentication_userassociatedclient authentication_userassociatedclient_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_userassociatedclient
    ADD CONSTRAINT authentication_userassociatedclient_pkey PRIMARY KEY (id);


--
-- Name: authentication_userassociateddevice authentication_userassociateddevice_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_userassociateddevice
    ADD CONSTRAINT authentication_userassociateddevice_pkey PRIMARY KEY (id);


--
-- Name: authentication_usersettings authentication_usersettings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_usersettings
    ADD CONSTRAINT authentication_usersettings_pkey PRIMARY KEY (id);


--
-- Name: authentication_usersettings authentication_usersettings_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_usersettings
    ADD CONSTRAINT authentication_usersettings_user_id_key UNIQUE (user_id);


--
-- Name: client_modules_modulemappingfornet client_modules_modulemappingfornet_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_modules_modulemappingfornet
    ADD CONSTRAINT client_modules_modulemappingfornet_pkey PRIMARY KEY (id);


--
-- Name: client_pic_mdlclientpic client_pic_mdlclientpic_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_pic_mdlclientpic
    ADD CONSTRAINT client_pic_mdlclientpic_pkey PRIMARY KEY (id);


--
-- Name: clients_appchannels clients_appchannels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients_appchannels
    ADD CONSTRAINT clients_appchannels_pkey PRIMARY KEY (id);


--
-- Name: clients_bulkaccountuploadedfile clients_bulkaccountuploadedfile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients_bulkaccountuploadedfile
    ADD CONSTRAINT clients_bulkaccountuploadedfile_pkey PRIMARY KEY (id);


--
-- Name: clients_clientinfo_client_pic clients_clientinfo_clien_clientinfo_id_clientpic__a32b7e0c_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients_clientinfo_client_pic
    ADD CONSTRAINT clients_clientinfo_clien_clientinfo_id_clientpic__a32b7e0c_uniq UNIQUE (clientinfo_id, clientpic_id);


--
-- Name: clients_clientinfo_client_pic clients_clientinfo_client_pic_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients_clientinfo_client_pic
    ADD CONSTRAINT clients_clientinfo_client_pic_pkey PRIMARY KEY (id);


--
-- Name: clients_clientinfo_dashboard_type clients_clientinfo_dashb_clientinfo_id_dashboardt_91a1c8c5_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients_clientinfo_dashboard_type
    ADD CONSTRAINT clients_clientinfo_dashb_clientinfo_id_dashboardt_91a1c8c5_uniq UNIQUE (clientinfo_id, dashboardtype_id);


--
-- Name: clients_clientinfo_dashboard_type clients_clientinfo_dashboard_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients_clientinfo_dashboard_type
    ADD CONSTRAINT clients_clientinfo_dashboard_type_pkey PRIMARY KEY (id);


--
-- Name: clients_clientinfo clients_clientinfo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients_clientinfo
    ADD CONSTRAINT clients_clientinfo_pkey PRIMARY KEY (id);


--
-- Name: clients_clientinfotorelationmapping clients_clientinfo_relat_clientinfo_id_clientrela_dcd98a49_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients_clientinfotorelationmapping
    ADD CONSTRAINT clients_clientinfo_relat_clientinfo_id_clientrela_dcd98a49_uniq UNIQUE (clientinfo_id, clientrelation_id);


--
-- Name: clients_clientinfotorelationmapping clients_clientinfo_relation_mapping_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients_clientinfotorelationmapping
    ADD CONSTRAINT clients_clientinfo_relation_mapping_pkey PRIMARY KEY (id);


--
-- Name: clients_clientinfo_secondary_languages clients_clientinfo_secon_clientinfo_id_secondaryl_46ac8aec_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients_clientinfo_secondary_languages
    ADD CONSTRAINT clients_clientinfo_secon_clientinfo_id_secondaryl_46ac8aec_uniq UNIQUE (clientinfo_id, secondarylanguages_id);


--
-- Name: clients_clientinfo_secondary_languages clients_clientinfo_secondary_languages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients_clientinfo_secondary_languages
    ADD CONSTRAINT clients_clientinfo_secondary_languages_pkey PRIMARY KEY (id);


--
-- Name: clients_clientinfoassociatedmodule clients_clientinfoassociatedmodule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients_clientinfoassociatedmodule
    ADD CONSTRAINT clients_clientinfoassociatedmodule_pkey PRIMARY KEY (id);


--
-- Name: clients_clientinfocustomfielddata clients_clientinfocustomfielddata_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients_clientinfocustomfielddata
    ADD CONSTRAINT clients_clientinfocustomfielddata_pkey PRIMARY KEY (id);


--
-- Name: clients_clientinfotoindustriesmapping clients_clientinfotoindustriesmapping_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients_clientinfotoindustriesmapping
    ADD CONSTRAINT clients_clientinfotoindustriesmapping_pkey PRIMARY KEY (id);


--
-- Name: clients_clientinfotolanguagesmapping clients_clientinfotolanguagesmapping_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients_clientinfotolanguagesmapping
    ADD CONSTRAINT clients_clientinfotolanguagesmapping_pkey PRIMARY KEY (id);


--
-- Name: clients_clientpic clients_clientpic_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients_clientpic
    ADD CONSTRAINT clients_clientpic_pkey PRIMARY KEY (id);


--
-- Name: clients_clientrelation clients_clientrelation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients_clientrelation
    ADD CONSTRAINT clients_clientrelation_pkey PRIMARY KEY (id);


--
-- Name: clients_customfield clients_customfield_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients_customfield
    ADD CONSTRAINT clients_customfield_pkey PRIMARY KEY (id);


--
-- Name: clients_dashboardtype clients_dashboardtype_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients_dashboardtype
    ADD CONSTRAINT clients_dashboardtype_pkey PRIMARY KEY (id);


--
-- Name: clients_mdlclientkeycounter clients_mdlclientkeycounter_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients_mdlclientkeycounter
    ADD CONSTRAINT clients_mdlclientkeycounter_pkey PRIMARY KEY (id);


--
-- Name: clients_optionvalue clients_optionvalue_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients_optionvalue
    ADD CONSTRAINT clients_optionvalue_pkey PRIMARY KEY (id);


--
-- Name: clients_secondarylanguages clients_secondarylanguages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients_secondarylanguages
    ADD CONSTRAINT clients_secondarylanguages_pkey PRIMARY KEY (id);


--
-- Name: company_lesson_association company_lesson_association_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_lesson_association
    ADD CONSTRAINT company_lesson_association_pkey PRIMARY KEY (id);


--
-- Name: django_admin_log django_admin_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_pkey PRIMARY KEY (id);


--
-- Name: django_celery_beat_clockedschedule django_celery_beat_clockedschedule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_celery_beat_clockedschedule
    ADD CONSTRAINT django_celery_beat_clockedschedule_pkey PRIMARY KEY (id);


--
-- Name: django_celery_beat_crontabschedule django_celery_beat_crontabschedule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_celery_beat_crontabschedule
    ADD CONSTRAINT django_celery_beat_crontabschedule_pkey PRIMARY KEY (id);


--
-- Name: django_celery_beat_intervalschedule django_celery_beat_intervalschedule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_celery_beat_intervalschedule
    ADD CONSTRAINT django_celery_beat_intervalschedule_pkey PRIMARY KEY (id);


--
-- Name: django_celery_beat_periodictask django_celery_beat_periodictask_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_celery_beat_periodictask
    ADD CONSTRAINT django_celery_beat_periodictask_name_key UNIQUE (name);


--
-- Name: django_celery_beat_periodictask django_celery_beat_periodictask_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_celery_beat_periodictask
    ADD CONSTRAINT django_celery_beat_periodictask_pkey PRIMARY KEY (id);


--
-- Name: django_celery_beat_periodictasks django_celery_beat_periodictasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_celery_beat_periodictasks
    ADD CONSTRAINT django_celery_beat_periodictasks_pkey PRIMARY KEY (ident);


--
-- Name: django_celery_beat_solarschedule django_celery_beat_solar_event_latitude_longitude_ba64999a_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_celery_beat_solarschedule
    ADD CONSTRAINT django_celery_beat_solar_event_latitude_longitude_ba64999a_uniq UNIQUE (event, latitude, longitude);


--
-- Name: django_celery_beat_solarschedule django_celery_beat_solarschedule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_celery_beat_solarschedule
    ADD CONSTRAINT django_celery_beat_solarschedule_pkey PRIMARY KEY (id);


--
-- Name: django_celery_results_chordcounter django_celery_results_chordcounter_group_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_celery_results_chordcounter
    ADD CONSTRAINT django_celery_results_chordcounter_group_id_key UNIQUE (group_id);


--
-- Name: django_celery_results_chordcounter django_celery_results_chordcounter_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_celery_results_chordcounter
    ADD CONSTRAINT django_celery_results_chordcounter_pkey PRIMARY KEY (id);


--
-- Name: django_celery_results_groupresult django_celery_results_groupresult_group_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_celery_results_groupresult
    ADD CONSTRAINT django_celery_results_groupresult_group_id_key UNIQUE (group_id);


--
-- Name: django_celery_results_groupresult django_celery_results_groupresult_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_celery_results_groupresult
    ADD CONSTRAINT django_celery_results_groupresult_pkey PRIMARY KEY (id);


--
-- Name: django_celery_results_taskresult django_celery_results_taskresult_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_celery_results_taskresult
    ADD CONSTRAINT django_celery_results_taskresult_pkey PRIMARY KEY (id);


--
-- Name: django_celery_results_taskresult django_celery_results_taskresult_task_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_celery_results_taskresult
    ADD CONSTRAINT django_celery_results_taskresult_task_id_key UNIQUE (task_id);


--
-- Name: django_celery_task django_celery_task_id_a5dba22e_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_celery_task
    ADD CONSTRAINT django_celery_task_id_a5dba22e_pk PRIMARY KEY (id);


--
-- Name: django_content_type django_content_type_app_label_model_76bd3d3b_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_content_type
    ADD CONSTRAINT django_content_type_app_label_model_76bd3d3b_uniq UNIQUE (app_label, model);


--
-- Name: django_content_type django_content_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_content_type
    ADD CONSTRAINT django_content_type_pkey PRIMARY KEY (id);


--
-- Name: django_migrations django_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_migrations
    ADD CONSTRAINT django_migrations_pkey PRIMARY KEY (id);


--
-- Name: django_session django_session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_session
    ADD CONSTRAINT django_session_pkey PRIMARY KEY (session_key);


--
-- Name: djangosaml2idp_persistentid djangosaml2idp_persistentid_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.djangosaml2idp_persistentid
    ADD CONSTRAINT djangosaml2idp_persistentid_pkey PRIMARY KEY (id);


--
-- Name: djangosaml2idp_serviceprovider djangosaml2idp_serviceprovider_entity_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.djangosaml2idp_serviceprovider
    ADD CONSTRAINT djangosaml2idp_serviceprovider_entity_id_key UNIQUE (entity_id);


--
-- Name: djangosaml2idp_serviceprovider djangosaml2idp_serviceprovider_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.djangosaml2idp_serviceprovider
    ADD CONSTRAINT djangosaml2idp_serviceprovider_pkey PRIMARY KEY (id);


--
-- Name: downtime_downtimepage downtime_downtimepage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.downtime_downtimepage
    ADD CONSTRAINT downtime_downtimepage_pkey PRIMARY KEY (id);


--
-- Name: feed_sync_watermark feed_sync_watermark_content_type_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feed_sync_watermark
    ADD CONSTRAINT feed_sync_watermark_content_type_key UNIQUE (content_type);


--
-- Name: feed_sync_watermark feed_sync_watermark_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feed_sync_watermark
    ADD CONSTRAINT feed_sync_watermark_pkey PRIMARY KEY (id);


--
-- Name: files_directory files_directory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files_directory
    ADD CONSTRAINT files_directory_pkey PRIMARY KEY (id);


--
-- Name: files_file files_file_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files_file
    ADD CONSTRAINT files_file_pkey PRIMARY KEY (id);


--
-- Name: health_check_db_testmodel health_check_db_testmodel_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.health_check_db_testmodel
    ADD CONSTRAINT health_check_db_testmodel_pkey PRIMARY KEY (id);


--
-- Name: clients_industry industry_industry_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients_industry
    ADD CONSTRAINT industry_industry_name_key UNIQUE (name);


--
-- Name: clients_industry industry_industry_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients_industry
    ADD CONSTRAINT industry_industry_pkey PRIMARY KEY (id);


--
-- Name: mdl_client_custom_field_values mdl_client_custom_field_values_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_client_custom_field_values
    ADD CONSTRAINT mdl_client_custom_field_values_pkey PRIMARY KEY (id);


--
-- Name: mdl_client_custom_fields mdl_client_custom_fields_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_client_custom_fields
    ADD CONSTRAINT mdl_client_custom_fields_pkey PRIMARY KEY (id);


--
-- Name: mdl_client_modules_config mdl_client_modules_config_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_client_modules_config
    ADD CONSTRAINT mdl_client_modules_config_pkey PRIMARY KEY (id);


--
-- Name: mdl_client_modules mdl_client_modules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_client_modules
    ADD CONSTRAINT mdl_client_modules_pkey PRIMARY KEY (id);


--
-- Name: clients_country mdl_country_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients_country
    ADD CONSTRAINT mdl_country_pkey PRIMARY KEY (id);


--
-- Name: mdl_language_fonts mdl_language_fonts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_language_fonts
    ADD CONSTRAINT mdl_language_fonts_pkey PRIMARY KEY (id);


--
-- Name: mdl_participant_image mdl_participant_image_key_vale_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_participant_image
    ADD CONSTRAINT mdl_participant_image_key_vale_key UNIQUE (key_vale);


--
-- Name: mdl_participant_image mdl_participant_image_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_participant_image
    ADD CONSTRAINT mdl_participant_image_pkey PRIMARY KEY (id);


--
-- Name: mdl_participant mdl_participant_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_participant
    ADD CONSTRAINT mdl_participant_pkey PRIMARY KEY (id);


--
-- Name: mdl_participants_phone mdl_participants_phone_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_participants_phone
    ADD CONSTRAINT mdl_participants_phone_pkey PRIMARY KEY (id);


--
-- Name: mdl_survey_option_bank_options mdl_survey_option_bank_o_mdlsurveyoptionbank_id_m_b0800d55_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_survey_option_bank_options
    ADD CONSTRAINT mdl_survey_option_bank_o_mdlsurveyoptionbank_id_m_b0800d55_uniq UNIQUE (mdlsurveyoptionbank_id, mdlsurveyoptionbankoptions_id);


--
-- Name: mdl_survey_option_bank_optionss_option_translations mdl_survey_option_bank_o_mdlsurveyoptionbankoptio_92694563_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_survey_option_bank_optionss_option_translations
    ADD CONSTRAINT mdl_survey_option_bank_o_mdlsurveyoptionbankoptio_92694563_uniq UNIQUE (mdlsurveyoptionbankoptions_id, mdlsurveyoptionbankoptiontranslations_id);


--
-- Name: mdl_survey_option_bank_option_translations mdl_survey_option_bank_option_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_survey_option_bank_option_translations
    ADD CONSTRAINT mdl_survey_option_bank_option_translations_pkey PRIMARY KEY (id);


--
-- Name: mdl_survey_option_bank_options mdl_survey_option_bank_options_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_survey_option_bank_options
    ADD CONSTRAINT mdl_survey_option_bank_options_pkey PRIMARY KEY (id);


--
-- Name: mdl_survey_option_bank_optionss_option_translations mdl_survey_option_bank_optionss_option_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_survey_option_bank_optionss_option_translations
    ADD CONSTRAINT mdl_survey_option_bank_optionss_option_translations_pkey PRIMARY KEY (id);


--
-- Name: mdl_survey_option_bank_optionss mdl_survey_option_bank_optionss_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_survey_option_bank_optionss
    ADD CONSTRAINT mdl_survey_option_bank_optionss_pkey PRIMARY KEY (id);


--
-- Name: mdl_survey_option_bank mdl_survey_option_bank_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_survey_option_bank
    ADD CONSTRAINT mdl_survey_option_bank_pkey PRIMARY KEY (id);


--
-- Name: mdl_survey_option_bank_title_translations mdl_survey_option_bank_t_mdlsurveyoptionbank_id_m_e61e4894_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_survey_option_bank_title_translations
    ADD CONSTRAINT mdl_survey_option_bank_t_mdlsurveyoptionbank_id_m_e61e4894_uniq UNIQUE (mdlsurveyoptionbank_id, mdlsurveyoptionbanktranslations_id);


--
-- Name: mdl_survey_option_bank_title_translations mdl_survey_option_bank_title_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_survey_option_bank_title_translations
    ADD CONSTRAINT mdl_survey_option_bank_title_translations_pkey PRIMARY KEY (id);


--
-- Name: mdl_survey_option_bank_translations mdl_survey_option_bank_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_survey_option_bank_translations
    ADD CONSTRAINT mdl_survey_option_bank_translations_pkey PRIMARY KEY (id);


--
-- Name: mdl_wc_attachment_task mdl_wc_attachment_task_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_wc_attachment_task
    ADD CONSTRAINT mdl_wc_attachment_task_pkey PRIMARY KEY (id);


--
-- Name: mdl_wc_contact_attachment_content mdl_wc_contact_attachment_content_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_wc_contact_attachment_content
    ADD CONSTRAINT mdl_wc_contact_attachment_content_pkey PRIMARY KEY (id);


--
-- Name: mdl_wc_contact_attachments mdl_wc_contact_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_wc_contact_attachments
    ADD CONSTRAINT mdl_wc_contact_attachments_pkey PRIMARY KEY (id);


--
-- Name: mdl_wc_contact_group_translations mdl_wc_contact_group_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_wc_contact_group_translations
    ADD CONSTRAINT mdl_wc_contact_group_translations_pkey PRIMARY KEY (id);


--
-- Name: mdl_wc_contact_groups mdl_wc_contact_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_wc_contact_groups
    ADD CONSTRAINT mdl_wc_contact_groups_pkey PRIMARY KEY (id);


--
-- Name: mdl_wc_contact_groups_translations mdl_wc_contact_groups_tr_mdlwccontactgroup_id_mdl_6e5d575a_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_wc_contact_groups_translations
    ADD CONSTRAINT mdl_wc_contact_groups_tr_mdlwccontactgroup_id_mdl_6e5d575a_uniq UNIQUE (mdlwccontactgroup_id, mdlwccontactgrouptranslations_id);


--
-- Name: mdl_wc_contact_groups_translations mdl_wc_contact_groups_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_wc_contact_groups_translations
    ADD CONSTRAINT mdl_wc_contact_groups_translations_pkey PRIMARY KEY (id);


--
-- Name: mdl_wc_participant_contact_group_relation mdl_wc_participant_contact_group_relation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_wc_participant_contact_group_relation
    ADD CONSTRAINT mdl_wc_participant_contact_group_relation_pkey PRIMARY KEY (id);


--
-- Name: mdl_wc_participant_counter mdl_wc_participant_counter_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_wc_participant_counter
    ADD CONSTRAINT mdl_wc_participant_counter_pkey PRIMARY KEY (id);


--
-- Name: mdl_wc_participant_custom_field_relation mdl_wc_participant_custom_field_relation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_wc_participant_custom_field_relation
    ADD CONSTRAINT mdl_wc_participant_custom_field_relation_pkey PRIMARY KEY (id);


--
-- Name: notifications_appnotification notifications_appnotification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications_appnotification
    ADD CONSTRAINT notifications_appnotification_pkey PRIMARY KEY (id);


--
-- Name: notifications_smscredits notifications_smscredits_client_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications_smscredits
    ADD CONSTRAINT notifications_smscredits_client_id_key UNIQUE (client_id);


--
-- Name: notifications_smscredits notifications_smscredits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications_smscredits
    ADD CONSTRAINT notifications_smscredits_pkey PRIMARY KEY (id);


--
-- Name: participants_clientcustomfieldconfig participants_clientcustomfieldconfig_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participants_clientcustomfieldconfig
    ADD CONSTRAINT participants_clientcustomfieldconfig_pkey PRIMARY KEY (id);


--
-- Name: participants_clientfieldconfig participants_clientfieldconfig_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participants_clientfieldconfig
    ADD CONSTRAINT participants_clientfieldconfig_pkey PRIMARY KEY (id);


--
-- Name: participants_participant_groups participants_participant_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participants_participant_groups
    ADD CONSTRAINT participants_participant_groups_pkey PRIMARY KEY (id);


--
-- Name: participants_participant_groups participants_participant_participant_id_participa_207670e2_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participants_participant_groups
    ADD CONSTRAINT participants_participant_participant_id_participa_207670e2_uniq UNIQUE (participant_id, participantgroups_id);


--
-- Name: participants_participant participants_participant_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participants_participant
    ADD CONSTRAINT participants_participant_pkey PRIMARY KEY (id);


--
-- Name: participants_participantfields participants_participantfields_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participants_participantfields
    ADD CONSTRAINT participants_participantfields_pkey PRIMARY KEY (id);


--
-- Name: participants_participantgroups participants_participantgroups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participants_participantgroups
    ADD CONSTRAINT participants_participantgroups_pkey PRIMARY KEY (id);


--
-- Name: payslip_employee payslip_employee_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payslip_employee
    ADD CONSTRAINT payslip_employee_pkey PRIMARY KEY (id);


--
-- Name: payslip_generated payslip_generated_payslip_employee_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payslip_generated
    ADD CONSTRAINT payslip_generated_payslip_employee_id_key UNIQUE (payslip_employee_id);


--
-- Name: payslip_generated payslip_generated_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payslip_generated
    ADD CONSTRAINT payslip_generated_pkey PRIMARY KEY (id);


--
-- Name: payslip payslip_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payslip
    ADD CONSTRAINT payslip_pkey PRIMARY KEY (id);


--
-- Name: payslip payslip_uploaded_file_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payslip
    ADD CONSTRAINT payslip_uploaded_file_id_key UNIQUE (uploaded_file_id);


--
-- Name: payslip_uploaded_file payslip_uploaded_file_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payslip_uploaded_file
    ADD CONSTRAINT payslip_uploaded_file_pkey PRIMARY KEY (id);


--
-- Name: shared_files_directory shared_files_directory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shared_files_directory
    ADD CONSTRAINT shared_files_directory_pkey PRIMARY KEY (id);


--
-- Name: shared_files_file shared_files_file_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shared_files_file
    ADD CONSTRAINT shared_files_file_pkey PRIMARY KEY (id);


--
-- Name: silk_profile silk_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.silk_profile
    ADD CONSTRAINT silk_profile_pkey PRIMARY KEY (id);


--
-- Name: silk_profile_queries silk_profile_queries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.silk_profile_queries
    ADD CONSTRAINT silk_profile_queries_pkey PRIMARY KEY (id);


--
-- Name: silk_profile_queries silk_profile_queries_profile_id_sqlquery_id_b2403d9b_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.silk_profile_queries
    ADD CONSTRAINT silk_profile_queries_profile_id_sqlquery_id_b2403d9b_uniq UNIQUE (profile_id, sqlquery_id);


--
-- Name: silk_request silk_request_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.silk_request
    ADD CONSTRAINT silk_request_pkey PRIMARY KEY (id);


--
-- Name: silk_response silk_response_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.silk_response
    ADD CONSTRAINT silk_response_pkey PRIMARY KEY (id);


--
-- Name: silk_response silk_response_request_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.silk_response
    ADD CONSTRAINT silk_response_request_id_key UNIQUE (request_id);


--
-- Name: silk_sqlquery silk_sqlquery_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.silk_sqlquery
    ADD CONSTRAINT silk_sqlquery_pkey PRIMARY KEY (id);


--
-- Name: supplier_risk_scores supplier_risk_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_risk_scores
    ADD CONSTRAINT supplier_risk_scores_pkey PRIMARY KEY (supplier_id);


--
-- Name: survey_mdlsurvey_active_languages survey_mdlsurvey_active_languages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurvey_active_languages
    ADD CONSTRAINT survey_mdlsurvey_active_languages_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurvey survey_mdlsurvey_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurvey
    ADD CONSTRAINT survey_mdlsurvey_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurvey_posters survey_mdlsurvey_posters_mdlsurvey_id_mdlsurveypo_ecd00385_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurvey_posters
    ADD CONSTRAINT survey_mdlsurvey_posters_mdlsurvey_id_mdlsurveypo_ecd00385_uniq UNIQUE (mdlsurvey_id, mdlsurveyposters_id);


--
-- Name: survey_mdlsurvey_posters survey_mdlsurvey_posters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurvey_posters
    ADD CONSTRAINT survey_mdlsurvey_posters_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurvey_questions survey_mdlsurvey_questio_mdlsurvey_id_mdlsurveyqu_4b3929fa_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurvey_questions
    ADD CONSTRAINT survey_mdlsurvey_questio_mdlsurvey_id_mdlsurveyqu_4b3929fa_uniq UNIQUE (mdlsurvey_id, mdlsurveyquestions_id);


--
-- Name: survey_mdlsurvey_questions survey_mdlsurvey_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurvey_questions
    ADD CONSTRAINT survey_mdlsurvey_questions_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurvey_reporting_categories survey_mdlsurvey_reporti_mdlsurvey_id_mdlsurveyre_79602109_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurvey_reporting_categories
    ADD CONSTRAINT survey_mdlsurvey_reporti_mdlsurvey_id_mdlsurveyre_79602109_uniq UNIQUE (mdlsurvey_id, mdlsurveyreportingcategory_id);


--
-- Name: survey_mdlsurvey_reporting_categories survey_mdlsurvey_reporting_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurvey_reporting_categories
    ADD CONSTRAINT survey_mdlsurvey_reporting_categories_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurvey_shared_clients survey_mdlsurvey_shared__mdlsurvey_id_clientinfo__4985c686_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurvey_shared_clients
    ADD CONSTRAINT survey_mdlsurvey_shared__mdlsurvey_id_clientinfo__4985c686_uniq UNIQUE (mdlsurvey_id, clientinfo_id);


--
-- Name: survey_mdlsurvey_shared_clients survey_mdlsurvey_shared_clients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurvey_shared_clients
    ADD CONSTRAINT survey_mdlsurvey_shared_clients_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurvey_supported_languages survey_mdlsurvey_support_mdlsurvey_id_mdlsupporte_64bdc7aa_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurvey_supported_languages
    ADD CONSTRAINT survey_mdlsurvey_support_mdlsurvey_id_mdlsupporte_64bdc7aa_uniq UNIQUE (mdlsurvey_id, mdlsupportedlanguages_id);


--
-- Name: survey_mdlsurvey_supported_languages survey_mdlsurvey_supported_languages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurvey_supported_languages
    ADD CONSTRAINT survey_mdlsurvey_supported_languages_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurvey_template_supported_languages survey_mdlsurvey_template_supported_languages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurvey_template_supported_languages
    ADD CONSTRAINT survey_mdlsurvey_template_supported_languages_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurvey_translations survey_mdlsurvey_transla_mdlsurvey_id_mdlsurveyti_5de51938_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurvey_translations
    ADD CONSTRAINT survey_mdlsurvey_transla_mdlsurvey_id_mdlsurveyti_5de51938_uniq UNIQUE (mdlsurvey_id, mdlsurveytitletranslations_id);


--
-- Name: survey_mdlsurvey_translations survey_mdlsurvey_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurvey_translations
    ADD CONSTRAINT survey_mdlsurvey_translations_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveyclientquestiontemplateconfig_client_id survey_mdlsurveyclientqu_mdlsurveyclientquestiont_061ee5cd_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyclientquestiontemplateconfig_client_id
    ADD CONSTRAINT survey_mdlsurveyclientqu_mdlsurveyclientquestiont_061ee5cd_uniq UNIQUE (mdlsurveyclientquestiontemplateconfig_id, clientinfo_id);


--
-- Name: survey_mdlsurveyclientquestiontemplateconfig_client_id survey_mdlsurveyclientquestiontemplateconfig_client_id_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyclientquestiontemplateconfig_client_id
    ADD CONSTRAINT survey_mdlsurveyclientquestiontemplateconfig_client_id_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveyclientquestiontemplateconfig survey_mdlsurveyclientquestiontemplateconfig_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyclientquestiontemplateconfig
    ADD CONSTRAINT survey_mdlsurveyclientquestiontemplateconfig_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveyclosingmessage_translation survey_mdlsurveyclosingm_mdlsurveyclosingmessage__477d0917_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyclosingmessage_translation
    ADD CONSTRAINT survey_mdlsurveyclosingm_mdlsurveyclosingmessage__477d0917_uniq UNIQUE (mdlsurveyclosingmessage_id, mdlsurveyclosingmessagetranslations_id);


--
-- Name: survey_mdlsurveyclosingmessage survey_mdlsurveyclosingmessage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyclosingmessage
    ADD CONSTRAINT survey_mdlsurveyclosingmessage_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveyclosingmessage_translation survey_mdlsurveyclosingmessage_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyclosingmessage_translation
    ADD CONSTRAINT survey_mdlsurveyclosingmessage_translation_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveyclosingmessagetranslations survey_mdlsurveyclosingmessagetranslations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyclosingmessagetranslations
    ADD CONSTRAINT survey_mdlsurveyclosingmessagetranslations_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveyopeningmessage_translation survey_mdlsurveyopeningm_mdlsurveyopeningmessage__486de738_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyopeningmessage_translation
    ADD CONSTRAINT survey_mdlsurveyopeningm_mdlsurveyopeningmessage__486de738_uniq UNIQUE (mdlsurveyopeningmessage_id, mdlsurveyopeningmessagetranslations_id);


--
-- Name: survey_mdlsurveyopeningmessage survey_mdlsurveyopeningmessage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyopeningmessage
    ADD CONSTRAINT survey_mdlsurveyopeningmessage_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveyopeningmessage_translation survey_mdlsurveyopeningmessage_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyopeningmessage_translation
    ADD CONSTRAINT survey_mdlsurveyopeningmessage_translation_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveyopeningmessagetranslations survey_mdlsurveyopeningmessagetranslations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyopeningmessagetranslations
    ADD CONSTRAINT survey_mdlsurveyopeningmessagetranslations_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveyposters survey_mdlsurveyposters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyposters
    ADD CONSTRAINT survey_mdlsurveyposters_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveyquestioncategory_client_id survey_mdlsurveyquestion_mdlsurveyquestioncategor_d5e69d1b_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestioncategory_client_id
    ADD CONSTRAINT survey_mdlsurveyquestion_mdlsurveyquestioncategor_d5e69d1b_uniq UNIQUE (mdlsurveyquestioncategory_id, clientinfo_id);


--
-- Name: survey_mdlsurveyquestionoptions_option_translations survey_mdlsurveyquestion_mdlsurveyquestionoptions_9e822106_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestionoptions_option_translations
    ADD CONSTRAINT survey_mdlsurveyquestion_mdlsurveyquestionoptions_9e822106_uniq UNIQUE (mdlsurveyquestionoptions_id, mdlsurveyquestionoptiontranslations_id);


--
-- Name: survey_mdlsurveyquestionoptionsmedia_client_id survey_mdlsurveyquestion_mdlsurveyquestionoptions_cc79b8ac_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestionoptionsmedia_client_id
    ADD CONSTRAINT survey_mdlsurveyquestion_mdlsurveyquestionoptions_cc79b8ac_uniq UNIQUE (mdlsurveyquestionoptionsmedia_id, clientinfo_id);


--
-- Name: survey_mdlsurveyquestions_question_options survey_mdlsurveyquestion_mdlsurveyquestions_id_md_4acb1afe_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestions_question_options
    ADD CONSTRAINT survey_mdlsurveyquestion_mdlsurveyquestions_id_md_4acb1afe_uniq UNIQUE (mdlsurveyquestions_id, mdlsurveyquestionoptions_id);


--
-- Name: survey_mdlsurveyquestions_translations survey_mdlsurveyquestion_mdlsurveyquestions_id_md_5fade4fc_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestions_translations
    ADD CONSTRAINT survey_mdlsurveyquestion_mdlsurveyquestions_id_md_5fade4fc_uniq UNIQUE (mdlsurveyquestions_id, mdlsurveyquestiontranslations_id);


--
-- Name: survey_mdlsurveyquestions_reporting_categories survey_mdlsurveyquestion_mdlsurveyquestions_id_md_e5598417_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestions_reporting_categories
    ADD CONSTRAINT survey_mdlsurveyquestion_mdlsurveyquestions_id_md_e5598417_uniq UNIQUE (mdlsurveyquestions_id, mdlsurveyreportingcategory_id);


--
-- Name: survey_mdlsurveyquestiontemplatemedia_client_id survey_mdlsurveyquestion_mdlsurveyquestiontemplat_057c0498_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestiontemplatemedia_client_id
    ADD CONSTRAINT survey_mdlsurveyquestion_mdlsurveyquestiontemplat_057c0498_uniq UNIQUE (mdlsurveyquestiontemplatemedia_id, clientinfo_id);


--
-- Name: survey_mdlsurveyquestiontemplatetranslations_client_id survey_mdlsurveyquestion_mdlsurveyquestiontemplat_6ad9b9ba_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestiontemplatetranslations_client_id
    ADD CONSTRAINT survey_mdlsurveyquestion_mdlsurveyquestiontemplat_6ad9b9ba_uniq UNIQUE (mdlsurveyquestiontemplatetranslations_id, clientinfo_id);


--
-- Name: survey_mdlsurveyquestiontemplate_client_id survey_mdlsurveyquestion_mdlsurveyquestiontemplat_8b5d86ea_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestiontemplate_client_id
    ADD CONSTRAINT survey_mdlsurveyquestion_mdlsurveyquestiontemplat_8b5d86ea_uniq UNIQUE (mdlsurveyquestiontemplate_id, clientinfo_id);


--
-- Name: survey_mdlsurveyquestiontemplatetypeconfig_client_id survey_mdlsurveyquestion_mdlsurveyquestiontemplat_b2154ee5_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestiontemplatetypeconfig_client_id
    ADD CONSTRAINT survey_mdlsurveyquestion_mdlsurveyquestiontemplat_b2154ee5_uniq UNIQUE (mdlsurveyquestiontemplatetypeconfig_id, clientinfo_id);


--
-- Name: survey_mdlsurveyquestioncategory_client_id survey_mdlsurveyquestioncategory_client_id_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestioncategory_client_id
    ADD CONSTRAINT survey_mdlsurveyquestioncategory_client_id_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveyquestioncategory survey_mdlsurveyquestioncategory_dic_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestioncategory
    ADD CONSTRAINT survey_mdlsurveyquestioncategory_dic_key_key UNIQUE (dic_key);


--
-- Name: survey_mdlsurveyquestioncategory survey_mdlsurveyquestioncategory_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestioncategory
    ADD CONSTRAINT survey_mdlsurveyquestioncategory_name_key UNIQUE (name);


--
-- Name: survey_mdlsurveyquestioncategory survey_mdlsurveyquestioncategory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestioncategory
    ADD CONSTRAINT survey_mdlsurveyquestioncategory_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveyquestionoptions_option_translations survey_mdlsurveyquestionoptions_option_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestionoptions_option_translations
    ADD CONSTRAINT survey_mdlsurveyquestionoptions_option_translations_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveyquestionoptions survey_mdlsurveyquestionoptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestionoptions
    ADD CONSTRAINT survey_mdlsurveyquestionoptions_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveyquestionoptionsmedia_client_id survey_mdlsurveyquestionoptionsmedia_client_id_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestionoptionsmedia_client_id
    ADD CONSTRAINT survey_mdlsurveyquestionoptionsmedia_client_id_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveyquestionoptionsmedia survey_mdlsurveyquestionoptionsmedia_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestionoptionsmedia
    ADD CONSTRAINT survey_mdlsurveyquestionoptionsmedia_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveyquestionoptiontranslations survey_mdlsurveyquestionoptiontranslations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestionoptiontranslations
    ADD CONSTRAINT survey_mdlsurveyquestionoptiontranslations_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveyquestionresponses survey_mdlsurveyquestionresponses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestionresponses
    ADD CONSTRAINT survey_mdlsurveyquestionresponses_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveyquestions survey_mdlsurveyquestions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestions
    ADD CONSTRAINT survey_mdlsurveyquestions_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveyquestions_question_options survey_mdlsurveyquestions_question_options_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestions_question_options
    ADD CONSTRAINT survey_mdlsurveyquestions_question_options_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveyquestions_reporting_categories survey_mdlsurveyquestions_reporting_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestions_reporting_categories
    ADD CONSTRAINT survey_mdlsurveyquestions_reporting_categories_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveyquestions_translations survey_mdlsurveyquestions_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestions_translations
    ADD CONSTRAINT survey_mdlsurveyquestions_translations_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveyquestiontemplate survey_mdlsurveyquestiontemplate_category_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestiontemplate
    ADD CONSTRAINT survey_mdlsurveyquestiontemplate_category_id_key UNIQUE (category_id);


--
-- Name: survey_mdlsurveyquestiontemplate_client_id survey_mdlsurveyquestiontemplate_client_id_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestiontemplate_client_id
    ADD CONSTRAINT survey_mdlsurveyquestiontemplate_client_id_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveyquestiontemplate survey_mdlsurveyquestiontemplate_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestiontemplate
    ADD CONSTRAINT survey_mdlsurveyquestiontemplate_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveyquestiontemplate survey_mdlsurveyquestiontemplate_q_type_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestiontemplate
    ADD CONSTRAINT survey_mdlsurveyquestiontemplate_q_type_id_key UNIQUE (q_type_id);


--
-- Name: survey_mdlsurveyquestiontemplatemedia_client_id survey_mdlsurveyquestiontemplatemedia_client_id_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestiontemplatemedia_client_id
    ADD CONSTRAINT survey_mdlsurveyquestiontemplatemedia_client_id_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveyquestiontemplatemedia survey_mdlsurveyquestiontemplatemedia_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestiontemplatemedia
    ADD CONSTRAINT survey_mdlsurveyquestiontemplatemedia_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveyquestiontemplatetranslations_client_id survey_mdlsurveyquestiontemplatetranslations_client_id_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestiontemplatetranslations_client_id
    ADD CONSTRAINT survey_mdlsurveyquestiontemplatetranslations_client_id_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveyquestiontemplatetranslations survey_mdlsurveyquestiontemplatetranslations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestiontemplatetranslations
    ADD CONSTRAINT survey_mdlsurveyquestiontemplatetranslations_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveyquestiontemplatetypeconfig_client_id survey_mdlsurveyquestiontemplatetypeconfig_client_id_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestiontemplatetypeconfig_client_id
    ADD CONSTRAINT survey_mdlsurveyquestiontemplatetypeconfig_client_id_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveyquestiontemplatetypeconfig survey_mdlsurveyquestiontemplatetypeconfig_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestiontemplatetypeconfig
    ADD CONSTRAINT survey_mdlsurveyquestiontemplatetypeconfig_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveyquestiontranslations survey_mdlsurveyquestiontranslations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestiontranslations
    ADD CONSTRAINT survey_mdlsurveyquestiontranslations_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveyquestiontype survey_mdlsurveyquestiontype_dic_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestiontype
    ADD CONSTRAINT survey_mdlsurveyquestiontype_dic_key_key UNIQUE (dic_key);


--
-- Name: survey_mdlsurveyquestiontype survey_mdlsurveyquestiontype_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestiontype
    ADD CONSTRAINT survey_mdlsurveyquestiontype_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveyquestiontypeoptions survey_mdlsurveyquestiontypeoptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestiontypeoptions
    ADD CONSTRAINT survey_mdlsurveyquestiontypeoptions_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveyreportingcategory_supported_languages survey_mdlsurveyreportin_mdlsurveyreportingcatego_19373cd7_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyreportingcategory_supported_languages
    ADD CONSTRAINT survey_mdlsurveyreportin_mdlsurveyreportingcatego_19373cd7_uniq UNIQUE (mdlsurveyreportingcategory_id, mdlsupportedlanguages_id);


--
-- Name: survey_mdlsurveyreportingcategory_translations survey_mdlsurveyreportin_mdlsurveyreportingcatego_b2869d57_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyreportingcategory_translations
    ADD CONSTRAINT survey_mdlsurveyreportin_mdlsurveyreportingcatego_b2869d57_uniq UNIQUE (mdlsurveyreportingcategory_id, mdlsurveyreportingcategorytranslations_id);


--
-- Name: survey_mdlsurveyreportingcategory survey_mdlsurveyreportingcategory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyreportingcategory
    ADD CONSTRAINT survey_mdlsurveyreportingcategory_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveyreportingcategory_supported_languages survey_mdlsurveyreportingcategory_supported_languages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyreportingcategory_supported_languages
    ADD CONSTRAINT survey_mdlsurveyreportingcategory_supported_languages_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveyreportingcategory_translations survey_mdlsurveyreportingcategory_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyreportingcategory_translations
    ADD CONSTRAINT survey_mdlsurveyreportingcategory_translations_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveyreportingcategorytranslations survey_mdlsurveyreportingcategorytranslations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyreportingcategorytranslations
    ADD CONSTRAINT survey_mdlsurveyreportingcategorytranslations_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveytemplate_shared_clients survey_mdlsurveytemplate_mdlsurveytemplate_id_cli_d9763d6e_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplate_shared_clients
    ADD CONSTRAINT survey_mdlsurveytemplate_mdlsurveytemplate_id_cli_d9763d6e_uniq UNIQUE (mdlsurveytemplate_id, clientinfo_id);


--
-- Name: survey_mdlsurveytemplate_supported_languages survey_mdlsurveytemplate_mdlsurveytemplate_id_mdl_212ae896_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplate_supported_languages
    ADD CONSTRAINT survey_mdlsurveytemplate_mdlsurveytemplate_id_mdl_212ae896_uniq UNIQUE (mdlsurveytemplate_id, mdlsupportedlanguages_id);


--
-- Name: survey_mdlsurveytemplate_translations survey_mdlsurveytemplate_mdlsurveytemplate_id_mdl_234d038d_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplate_translations
    ADD CONSTRAINT survey_mdlsurveytemplate_mdlsurveytemplate_id_mdl_234d038d_uniq UNIQUE (mdlsurveytemplate_id, mdlsurveytemplatetranslations_id);


--
-- Name: survey_mdlsurveytemplate_questions survey_mdlsurveytemplate_mdlsurveytemplate_id_mdl_42caa7db_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplate_questions
    ADD CONSTRAINT survey_mdlsurveytemplate_mdlsurveytemplate_id_mdl_42caa7db_uniq UNIQUE (mdlsurveytemplate_id, mdlsurveytemplatequestion_id);


--
-- Name: survey_mdlsurveytemplate_posters survey_mdlsurveytemplate_mdlsurveytemplate_id_mdl_4774bacb_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplate_posters
    ADD CONSTRAINT survey_mdlsurveytemplate_mdlsurveytemplate_id_mdl_4774bacb_uniq UNIQUE (mdlsurveytemplate_id, mdlsurveytemplateposters_id);


--
-- Name: survey_mdlsurveytemplate_reporting_categories survey_mdlsurveytemplate_mdlsurveytemplate_id_mdl_c941eaad_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplate_reporting_categories
    ADD CONSTRAINT survey_mdlsurveytemplate_mdlsurveytemplate_id_mdl_c941eaad_uniq UNIQUE (mdlsurveytemplate_id, mdlsurveyreportingcategory_id);


--
-- Name: survey_mdlsurveytemplatequestion_translations survey_mdlsurveytemplate_mdlsurveytemplatequestio_1d966a09_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplatequestion_translations
    ADD CONSTRAINT survey_mdlsurveytemplate_mdlsurveytemplatequestio_1d966a09_uniq UNIQUE (mdlsurveytemplatequestion_id, mdlsurveytemplatequestiontranslations_id);


--
-- Name: survey_mdlsurveytemplatequestion_reporting_categories survey_mdlsurveytemplate_mdlsurveytemplatequestio_449c709a_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplatequestion_reporting_categories
    ADD CONSTRAINT survey_mdlsurveytemplate_mdlsurveytemplatequestio_449c709a_uniq UNIQUE (mdlsurveytemplatequestion_id, mdlsurveyreportingcategory_id);


--
-- Name: survey_mdlsurveytemplatequestionoptions_option_translations survey_mdlsurveytemplate_mdlsurveytemplatequestio_61639591_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplatequestionoptions_option_translations
    ADD CONSTRAINT survey_mdlsurveytemplate_mdlsurveytemplatequestio_61639591_uniq UNIQUE (mdlsurveytemplatequestionoptions_id, mdlsurveytemplatequestionoptionstranslations_id);


--
-- Name: survey_mdlsurveytemplatequestion_question_options survey_mdlsurveytemplate_mdlsurveytemplatequestio_d356beaa_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplatequestion_question_options
    ADD CONSTRAINT survey_mdlsurveytemplate_mdlsurveytemplatequestio_d356beaa_uniq UNIQUE (mdlsurveytemplatequestion_id, mdlsurveytemplatequestionoptions_id);


--
-- Name: survey_mdlsurveytemplate survey_mdlsurveytemplate_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplate
    ADD CONSTRAINT survey_mdlsurveytemplate_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveytemplate_posters survey_mdlsurveytemplate_posters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplate_posters
    ADD CONSTRAINT survey_mdlsurveytemplate_posters_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveytemplate_questions survey_mdlsurveytemplate_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplate_questions
    ADD CONSTRAINT survey_mdlsurveytemplate_questions_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveytemplate_reporting_categories survey_mdlsurveytemplate_reporting_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplate_reporting_categories
    ADD CONSTRAINT survey_mdlsurveytemplate_reporting_categories_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveytemplate_shared_clients survey_mdlsurveytemplate_shared_clients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplate_shared_clients
    ADD CONSTRAINT survey_mdlsurveytemplate_shared_clients_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveytemplate_supported_languages survey_mdlsurveytemplate_supported_languages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplate_supported_languages
    ADD CONSTRAINT survey_mdlsurveytemplate_supported_languages_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveytemplate_translations survey_mdlsurveytemplate_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplate_translations
    ADD CONSTRAINT survey_mdlsurveytemplate_translations_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveytemplateposters survey_mdlsurveytemplateposters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplateposters
    ADD CONSTRAINT survey_mdlsurveytemplateposters_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveytemplatequestion survey_mdlsurveytemplatequestion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplatequestion
    ADD CONSTRAINT survey_mdlsurveytemplatequestion_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveytemplatequestion_question_options survey_mdlsurveytemplatequestion_question_options_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplatequestion_question_options
    ADD CONSTRAINT survey_mdlsurveytemplatequestion_question_options_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveytemplatequestion_reporting_categories survey_mdlsurveytemplatequestion_reporting_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplatequestion_reporting_categories
    ADD CONSTRAINT survey_mdlsurveytemplatequestion_reporting_categories_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveytemplatequestion_translations survey_mdlsurveytemplatequestion_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplatequestion_translations
    ADD CONSTRAINT survey_mdlsurveytemplatequestion_translations_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveytemplatequestionoptions_option_translations survey_mdlsurveytemplatequestionoptions_option_translation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplatequestionoptions_option_translations
    ADD CONSTRAINT survey_mdlsurveytemplatequestionoptions_option_translation_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveytemplatequestionoptions survey_mdlsurveytemplatequestionoptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplatequestionoptions
    ADD CONSTRAINT survey_mdlsurveytemplatequestionoptions_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveytemplatequestionoptionstranslations survey_mdlsurveytemplatequestionoptionstranslations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplatequestionoptionstranslations
    ADD CONSTRAINT survey_mdlsurveytemplatequestionoptionstranslations_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveytemplatequestiontranslations survey_mdlsurveytemplatequestiontranslations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplatequestiontranslations
    ADD CONSTRAINT survey_mdlsurveytemplatequestiontranslations_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveytemplatetranslations survey_mdlsurveytemplatetranslations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplatetranslations
    ADD CONSTRAINT survey_mdlsurveytemplatetranslations_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveytitletranslations survey_mdlsurveytitletranslations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytitletranslations
    ADD CONSTRAINT survey_mdlsurveytitletranslations_pkey PRIMARY KEY (id);


--
-- Name: survey_mdlsurveyuserresponses survey_mdlsurveyuserresponses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyuserresponses
    ADD CONSTRAINT survey_mdlsurveyuserresponses_pkey PRIMARY KEY (id);


--
-- Name: survey_surveyhistory survey_surveyhistory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_surveyhistory
    ADD CONSTRAINT survey_surveyhistory_pkey PRIMARY KEY (id);


--
-- Name: survey_surveyinvite survey_surveyinvite_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_surveyinvite
    ADD CONSTRAINT survey_surveyinvite_pkey PRIMARY KEY (id);


--
-- Name: survey_surveyinvitesworkers survey_surveyinvitesworkers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_surveyinvitesworkers
    ADD CONSTRAINT survey_surveyinvitesworkers_pkey PRIMARY KEY (id);


--
-- Name: survey_template_active_languages survey_template_active_languages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_template_active_languages
    ADD CONSTRAINT survey_template_active_languages_pkey PRIMARY KEY (id);


--
-- Name: translations_mdlsupportedlanguages_fonts translations_mdlsupporte_mdlsupportedlanguages_id_4f0178da_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.translations_mdlsupportedlanguages_fonts
    ADD CONSTRAINT translations_mdlsupporte_mdlsupportedlanguages_id_4f0178da_uniq UNIQUE (mdlsupportedlanguages_id, mdllanguagefonts_id);


--
-- Name: translations_mdlsupportedlanguages_fonts translations_mdlsupportedlanguages_fonts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.translations_mdlsupportedlanguages_fonts
    ADD CONSTRAINT translations_mdlsupportedlanguages_fonts_pkey PRIMARY KEY (id);


--
-- Name: translations_mdlsupportedlanguages translations_mdlsupportedlanguages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.translations_mdlsupportedlanguages
    ADD CONSTRAINT translations_mdlsupportedlanguages_pkey PRIMARY KEY (id);


--
-- Name: translations_mdltranslationconfig translations_mdltranslationconfig_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.translations_mdltranslationconfig
    ADD CONSTRAINT translations_mdltranslationconfig_pkey PRIMARY KEY (id);


--
-- Name: translations_mdltranslations translations_mdltranslations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.translations_mdltranslations
    ADD CONSTRAINT translations_mdltranslations_pkey PRIMARY KEY (id);


--
-- Name: djangosaml2idp_persistentid unique_ids_per_sp; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.djangosaml2idp_persistentid
    ADD CONSTRAINT unique_ids_per_sp UNIQUE (sp_id, persistent_id);


--
-- Name: djangosaml2idp_persistentid unique_users_per_sp; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.djangosaml2idp_persistentid
    ADD CONSTRAINT unique_users_per_sp UNIQUE (sp_id, user_id);


--
-- Name: user_feed_cache user_feed_cache_participant_identifier_c_b500f5d6_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_feed_cache
    ADD CONSTRAINT user_feed_cache_participant_identifier_c_b500f5d6_uniq UNIQUE (participant_identifier, content_type, content_id);


--
-- Name: user_feed_cache user_feed_cache_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_feed_cache
    ADD CONSTRAINT user_feed_cache_pkey PRIMARY KEY (id);


--
-- Name: user_roles_mdluseraccessmodule user_roles_mdluseraccessmodule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles_mdluseraccessmodule
    ADD CONSTRAINT user_roles_mdluseraccessmodule_pkey PRIMARY KEY (id);


--
-- Name: user_roles_mdluseraccessrole user_roles_mdluseraccessrole_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles_mdluseraccessrole
    ADD CONSTRAINT user_roles_mdluseraccessrole_pkey PRIMARY KEY (id);


--
-- Name: user_roles_mdluseraccessrolemoduleconfig user_roles_mdluseraccessrolemoduleconfig_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles_mdluseraccessrolemoduleconfig
    ADD CONSTRAINT user_roles_mdluseraccessrolemoduleconfig_pkey PRIMARY KEY (id);


--
-- Name: user_roles_mdluseraccessuserroleconfig user_roles_mdluseraccessuserroleconfig_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles_mdluseraccessuserroleconfig
    ADD CONSTRAINT user_roles_mdluseraccessuserroleconfig_pkey PRIMARY KEY (id);


--
-- Name: user_settings_mdlusersettings user_settings_mdlusersettings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_settings_mdlusersettings
    ADD CONSTRAINT user_settings_mdlusersettings_pkey PRIMARY KEY (id);


--
-- Name: worker_contact_resetcontactregistration worker_contact_resetcontactregistration_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_contact_resetcontactregistration
    ADD CONSTRAINT worker_contact_resetcontactregistration_pkey PRIMARY KEY (id);


--
-- Name: worker_contact_resetcontactregistration worker_contact_resetcontactregistration_uploaded_file_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_contact_resetcontactregistration
    ADD CONSTRAINT worker_contact_resetcontactregistration_uploaded_file_id_key UNIQUE (uploaded_file_id);


--
-- Name: worker_contact_resetcontactregistrationfile worker_contact_resetcontactregistrationfile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_contact_resetcontactregistrationfile
    ADD CONSTRAINT worker_contact_resetcontactregistrationfile_pkey PRIMARY KEY (id);


--
-- Name: wovo_import_mdlclientusers wovo_import_mdlclientusers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wovo_import_mdlclientusers
    ADD CONSTRAINT wovo_import_mdlclientusers_pkey PRIMARY KEY (id);


--
-- Name: wovo_import_mdluser_groups wovo_import_mdluser_groups_mdluser_id_group_id_316b6b48_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wovo_import_mdluser_groups
    ADD CONSTRAINT wovo_import_mdluser_groups_mdluser_id_group_id_316b6b48_uniq UNIQUE (mdluser_id, group_id);


--
-- Name: wovo_import_mdluser_groups wovo_import_mdluser_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wovo_import_mdluser_groups
    ADD CONSTRAINT wovo_import_mdluser_groups_pkey PRIMARY KEY (id);


--
-- Name: wovo_import_mdluser_user_permissions wovo_import_mdluser_user_mdluser_id_permission_id_c536e1eb_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wovo_import_mdluser_user_permissions
    ADD CONSTRAINT wovo_import_mdluser_user_mdluser_id_permission_id_c536e1eb_uniq UNIQUE (mdluser_id, permission_id);


--
-- Name: wovo_import_mdluser_user_permissions wovo_import_mdluser_user_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wovo_import_mdluser_user_permissions
    ADD CONSTRAINT wovo_import_mdluser_user_permissions_pkey PRIMARY KEY (id);


--
-- Name: wovo_login_adminusers wovo_login_adminusers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wovo_login_adminusers
    ADD CONSTRAINT wovo_login_adminusers_pkey PRIMARY KEY (mdluser_ptr_id);


--
-- Name: account_managers_mdlaccoun_mdlaccountmanagers_id_423991ce; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX account_managers_mdlaccoun_mdlaccountmanagers_id_423991ce ON public.account_managers_mdlaccountmanagers_countries USING btree (mdlaccountmanagers_id);


--
-- Name: account_managers_mdlaccoun_mdlaccountmanagerscountry__e24fd273; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX account_managers_mdlaccoun_mdlaccountmanagerscountry__e24fd273 ON public.account_managers_mdlaccountmanagers_countries USING btree (mdlaccountmanagerscountry_id);


--
-- Name: auth_group_name_a6ea08ec_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_group_name_a6ea08ec_like ON public.auth_group USING btree (name varchar_pattern_ops);


--
-- Name: auth_group_permissions_group_id_b120cbf9; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_group_permissions_group_id_b120cbf9 ON public.auth_group_permissions USING btree (group_id);


--
-- Name: auth_group_permissions_permission_id_84c5c92e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_group_permissions_permission_id_84c5c92e ON public.auth_group_permissions USING btree (permission_id);


--
-- Name: auth_permission_content_type_id_2f476e4b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_permission_content_type_id_2f476e4b ON public.auth_permission USING btree (content_type_id);


--
-- Name: authentication_module_created_by_id_a82e2143; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX authentication_module_created_by_id_a82e2143 ON public.authentication_module USING btree (created_by_id);


--
-- Name: authentication_module_modified_by_id_3e7150c1; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX authentication_module_modified_by_id_3e7150c1 ON public.authentication_module USING btree (modified_by_id);


--
-- Name: authentication_module_parent_id_1e58a022; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX authentication_module_parent_id_1e58a022 ON public.authentication_module USING btree (parent_id);


--
-- Name: authentication_modulemappingfornet_created_by_id_421ed2ee; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX authentication_modulemappingfornet_created_by_id_421ed2ee ON public.authentication_modulemappingfornet USING btree (created_by_id);


--
-- Name: authentication_modulemappingfornet_modified_by_id_748e161c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX authentication_modulemappingfornet_modified_by_id_748e161c ON public.authentication_modulemappingfornet USING btree (modified_by_id);


--
-- Name: authentication_modulemappingfornet_module_id_0425a7ce; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX authentication_modulemappingfornet_module_id_0425a7ce ON public.authentication_modulemappingfornet USING btree (module_id);


--
-- Name: authentication_passwordtoken_user_id_fe127b5e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX authentication_passwordtoken_user_id_fe127b5e ON public.authentication_passwordtoken USING btree (user_id);


--
-- Name: authentication_role_created_by_id_9be63d03; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX authentication_role_created_by_id_9be63d03 ON public.authentication_role USING btree (created_by_id);


--
-- Name: authentication_role_modified_by_id_d20abe09; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX authentication_role_modified_by_id_d20abe09 ON public.authentication_role USING btree (modified_by_id);


--
-- Name: authentication_role_parent_id_a555eb83; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX authentication_role_parent_id_a555eb83 ON public.authentication_role USING btree (parent_id);


--
-- Name: authentication_roleassociatedmodule_module_id_e90c36b0; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX authentication_roleassociatedmodule_module_id_e90c36b0 ON public.authentication_roleassociatedmodule USING btree (module_id);


--
-- Name: authentication_roleassociatedmodule_role_id_e5fc45a3; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX authentication_roleassociatedmodule_role_id_e5fc45a3 ON public.authentication_roleassociatedmodule USING btree (role_id);


--
-- Name: authentication_user_created_by_id_d3f2a616; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX authentication_user_created_by_id_d3f2a616 ON public.authentication_user USING btree (created_by_id);


--
-- Name: authentication_user_current_client_info_id_6c94e6ff; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX authentication_user_current_client_info_id_6c94e6ff ON public.authentication_user USING btree (current_client_info_id);


--
-- Name: authentication_user_deactivated_by_id_a4df2cd6; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX authentication_user_deactivated_by_id_a4df2cd6 ON public.authentication_user USING btree (deactivated_by_id);


--
-- Name: authentication_user_groups_group_id_6b5c44b7; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX authentication_user_groups_group_id_6b5c44b7 ON public.authentication_user_groups USING btree (group_id);


--
-- Name: authentication_user_groups_user_id_30868577; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX authentication_user_groups_user_id_30868577 ON public.authentication_user_groups USING btree (user_id);


--
-- Name: authentication_user_modified_by_id_c1b65ed0; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX authentication_user_modified_by_id_c1b65ed0 ON public.authentication_user USING btree (modified_by_id);


--
-- Name: authentication_user_role_id_24664e00; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX authentication_user_role_id_24664e00 ON public.authentication_user USING btree (role_id);


--
-- Name: authentication_user_user_permissions_permission_id_ea6be19a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX authentication_user_user_permissions_permission_id_ea6be19a ON public.authentication_user_user_permissions USING btree (permission_id);


--
-- Name: authentication_user_user_permissions_user_id_736ebf7e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX authentication_user_user_permissions_user_id_736ebf7e ON public.authentication_user_user_permissions USING btree (user_id);


--
-- Name: authentication_user_username_a09a089e_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX authentication_user_username_a09a089e_like ON public.authentication_user USING btree (username varchar_pattern_ops);


--
-- Name: authentication_userassociatedclient_client_info_id_1fcb3245; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX authentication_userassociatedclient_client_info_id_1fcb3245 ON public.authentication_userassociatedclient USING btree (client_info_id);


--
-- Name: authentication_userassociatedclient_user_id_4fe1d1b0; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX authentication_userassociatedclient_user_id_4fe1d1b0 ON public.authentication_userassociatedclient USING btree (user_id);


--
-- Name: authentication_userassociateddevice_avatar_id_fefa4054; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX authentication_userassociateddevice_avatar_id_fefa4054 ON public.authentication_userassociateddevice USING btree (avatar_id);


--
-- Name: authentication_userassociateddevice_secret_question_id_ff11eb67; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX authentication_userassociateddevice_secret_question_id_ff11eb67 ON public.authentication_userassociateddevice USING btree (secret_question_id);


--
-- Name: authentication_userassociateddevice_user_id_58af1ddd; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX authentication_userassociateddevice_user_id_58af1ddd ON public.authentication_userassociateddevice USING btree (user_id);


--
-- Name: authentication_usersettings_language_id_6d0fdb31; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX authentication_usersettings_language_id_6d0fdb31 ON public.authentication_usersettings USING btree (language_id);


--
-- Name: authentication_usersettings_preferred_font_id_b8a3183f; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX authentication_usersettings_preferred_font_id_b8a3183f ON public.authentication_usersettings USING btree (preferred_font_id);


--
-- Name: client_modules_modulemappingfornet_module_id_78b91cbb; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX client_modules_modulemappingfornet_module_id_78b91cbb ON public.client_modules_modulemappingfornet USING btree (module_id);


--
-- Name: clientinfo_client_id_gin_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clientinfo_client_id_gin_idx ON public.clients_clientinfo USING gin (upper((client_id)::text) public.gin_trgm_ops);


--
-- Name: clientinfo_countrygin_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clientinfo_countrygin_idx ON public.clients_clientinfo USING gin (upper((country)::text) public.gin_trgm_ops);


--
-- Name: clientinfo_name_gin_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clientinfo_name_gin_idx ON public.clients_clientinfo USING gin (upper((name)::text) public.gin_trgm_ops);


--
-- Name: clients_clientinfo_app_channel_id_d4563a26; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clients_clientinfo_app_channel_id_d4563a26 ON public.clients_clientinfo USING btree (app_channel_id);


--
-- Name: clients_clientinfo_client_pic_clientinfo_id_1d503374; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clients_clientinfo_client_pic_clientinfo_id_1d503374 ON public.clients_clientinfo_client_pic USING btree (clientinfo_id);


--
-- Name: clients_clientinfo_client_pic_clientpic_id_3ac880d7; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clients_clientinfo_client_pic_clientpic_id_3ac880d7 ON public.clients_clientinfo_client_pic USING btree (clientpic_id);


--
-- Name: clients_clientinfo_country_mapping_id_6a96a79b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clients_clientinfo_country_mapping_id_6a96a79b ON public.clients_clientinfo USING btree (country_mapping_id);


--
-- Name: clients_clientinfo_dashboard_type_clientinfo_id_af7b1d57; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clients_clientinfo_dashboard_type_clientinfo_id_af7b1d57 ON public.clients_clientinfo_dashboard_type USING btree (clientinfo_id);


--
-- Name: clients_clientinfo_dashboard_type_dashboardtype_id_c5ee8c09; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clients_clientinfo_dashboard_type_dashboardtype_id_c5ee8c09 ON public.clients_clientinfo_dashboard_type USING btree (dashboardtype_id);


--
-- Name: clients_clientinfo_relation_mapping_clientinfo_id_c8b57958; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clients_clientinfo_relation_mapping_clientinfo_id_c8b57958 ON public.clients_clientinfotorelationmapping USING btree (clientinfo_id);


--
-- Name: clients_clientinfo_relation_mapping_clientrelation_id_ad617af0; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clients_clientinfo_relation_mapping_clientrelation_id_ad617af0 ON public.clients_clientinfotorelationmapping USING btree (clientrelation_id);


--
-- Name: clients_clientinfo_seconda_secondarylanguages_id_ab88ef0d; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clients_clientinfo_seconda_secondarylanguages_id_ab88ef0d ON public.clients_clientinfo_secondary_languages USING btree (secondarylanguages_id);


--
-- Name: clients_clientinfo_secondary_languages_clientinfo_id_983654ae; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clients_clientinfo_secondary_languages_clientinfo_id_983654ae ON public.clients_clientinfo_secondary_languages USING btree (clientinfo_id);


--
-- Name: clients_clientinfoassociatedmodule_client_info_id_47eafe5b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clients_clientinfoassociatedmodule_client_info_id_47eafe5b ON public.clients_clientinfoassociatedmodule USING btree (client_info_id);


--
-- Name: clients_clientinfoassociatedmodule_created_by_id_3ad33a57; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clients_clientinfoassociatedmodule_created_by_id_3ad33a57 ON public.clients_clientinfoassociatedmodule USING btree (created_by_id);


--
-- Name: clients_clientinfoassociatedmodule_modified_by_id_5cf5ef57; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clients_clientinfoassociatedmodule_modified_by_id_5cf5ef57 ON public.clients_clientinfoassociatedmodule USING btree (modified_by_id);


--
-- Name: clients_clientinfoassociatedmodule_module_id_a4b1a839; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clients_clientinfoassociatedmodule_module_id_a4b1a839 ON public.clients_clientinfoassociatedmodule USING btree (module_id);


--
-- Name: clients_clientinfocustomfielddata_clientinfo_id_223fcbb6; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clients_clientinfocustomfielddata_clientinfo_id_223fcbb6 ON public.clients_clientinfocustomfielddata USING btree (clientinfo_id);


--
-- Name: clients_clientinfocustomfielddata_custom_field_id_b0e2087a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clients_clientinfocustomfielddata_custom_field_id_b0e2087a ON public.clients_clientinfocustomfielddata USING btree (custom_field_id);


--
-- Name: clients_clientinfotoindustriesmapping_clientinfo_id_a1cc97ea; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clients_clientinfotoindustriesmapping_clientinfo_id_a1cc97ea ON public.clients_clientinfotoindustriesmapping USING btree (clientinfo_id);


--
-- Name: clients_clientinfotoindustriesmapping_industry_id_50185ccd; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clients_clientinfotoindustriesmapping_industry_id_50185ccd ON public.clients_clientinfotoindustriesmapping USING btree (industry_id);


--
-- Name: clients_clientinfotolanguagesmapping_clientinfo_id_07337c13; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clients_clientinfotolanguagesmapping_clientinfo_id_07337c13 ON public.clients_clientinfotolanguagesmapping USING btree (clientinfo_id);


--
-- Name: clients_clientinfotolanguagesmapping_language_id_03154706; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clients_clientinfotolanguagesmapping_language_id_03154706 ON public.clients_clientinfotolanguagesmapping USING btree (language_id);


--
-- Name: clients_customfield_clientinfo_id_51bf1329; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clients_customfield_clientinfo_id_51bf1329 ON public.clients_customfield USING btree (clientinfo_id);


--
-- Name: clients_optionvalue_custom_field_id_896f0a9f; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX clients_optionvalue_custom_field_id_896f0a9f ON public.clients_optionvalue USING btree (custom_field_id);


--
-- Name: company_les_company_ffd952_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX company_les_company_ffd952_idx ON public.company_lesson_association USING btree (company_id);


--
-- Name: company_les_lesson__fdebdb_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX company_les_lesson__fdebdb_idx ON public.company_lesson_association USING btree (lesson_id);


--
-- Name: company_les_scorm_i_c80711_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX company_les_scorm_i_c80711_idx ON public.company_lesson_association USING btree (scorm_idnumber);


--
-- Name: country_name_gin_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX country_name_gin_idx ON public.clients_country USING gin (upper(name) public.gin_trgm_ops);


--
-- Name: django_admin_log_content_type_id_c4bce8eb; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_admin_log_content_type_id_c4bce8eb ON public.django_admin_log USING btree (content_type_id);


--
-- Name: django_admin_log_user_id_c564eba6; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_admin_log_user_id_c564eba6 ON public.django_admin_log USING btree (user_id);


--
-- Name: django_cele_date_cr_bd6c1d_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_cele_date_cr_bd6c1d_idx ON public.django_celery_results_groupresult USING btree (date_created);


--
-- Name: django_cele_date_cr_f04a50_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_cele_date_cr_f04a50_idx ON public.django_celery_results_taskresult USING btree (date_created);


--
-- Name: django_cele_date_do_caae0e_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_cele_date_do_caae0e_idx ON public.django_celery_results_groupresult USING btree (date_done);


--
-- Name: django_cele_date_do_f59aad_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_cele_date_do_f59aad_idx ON public.django_celery_results_taskresult USING btree (date_done);


--
-- Name: django_cele_status_9b6201_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_cele_status_9b6201_idx ON public.django_celery_results_taskresult USING btree (status);


--
-- Name: django_cele_task_na_08aec9_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_cele_task_na_08aec9_idx ON public.django_celery_results_taskresult USING btree (task_name);


--
-- Name: django_cele_worker_d54dd8_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_cele_worker_d54dd8_idx ON public.django_celery_results_taskresult USING btree (worker);


--
-- Name: django_celery_beat_periodictask_clocked_id_47a69f82; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_celery_beat_periodictask_clocked_id_47a69f82 ON public.django_celery_beat_periodictask USING btree (clocked_id);


--
-- Name: django_celery_beat_periodictask_crontab_id_d3cba168; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_celery_beat_periodictask_crontab_id_d3cba168 ON public.django_celery_beat_periodictask USING btree (crontab_id);


--
-- Name: django_celery_beat_periodictask_interval_id_a8ca27da; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_celery_beat_periodictask_interval_id_a8ca27da ON public.django_celery_beat_periodictask USING btree (interval_id);


--
-- Name: django_celery_beat_periodictask_name_265a36b7_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_celery_beat_periodictask_name_265a36b7_like ON public.django_celery_beat_periodictask USING btree (name varchar_pattern_ops);


--
-- Name: django_celery_beat_periodictask_solar_id_a87ce72c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_celery_beat_periodictask_solar_id_a87ce72c ON public.django_celery_beat_periodictask USING btree (solar_id);


--
-- Name: django_celery_results_chordcounter_group_id_1f70858c_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_celery_results_chordcounter_group_id_1f70858c_like ON public.django_celery_results_chordcounter USING btree (group_id varchar_pattern_ops);


--
-- Name: django_celery_results_groupresult_group_id_a085f1a9_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_celery_results_groupresult_group_id_a085f1a9_like ON public.django_celery_results_groupresult USING btree (group_id varchar_pattern_ops);


--
-- Name: django_celery_results_taskresult_task_id_de0d95bf_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_celery_results_taskresult_task_id_de0d95bf_like ON public.django_celery_results_taskresult USING btree (task_id varchar_pattern_ops);


--
-- Name: django_celery_task_task_id_8a188da5_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_celery_task_task_id_8a188da5_like ON public.django_celery_task USING btree (id varchar_pattern_ops);


--
-- Name: django_session_expire_date_a5c62663; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_session_expire_date_a5c62663 ON public.django_session USING btree (expire_date);


--
-- Name: django_session_session_key_c0390e0f_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_session_session_key_c0390e0f_like ON public.django_session USING btree (session_key varchar_pattern_ops);


--
-- Name: djangosaml2_entity__5fb9e3_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX djangosaml2_entity__5fb9e3_idx ON public.djangosaml2idp_serviceprovider USING btree (entity_id);


--
-- Name: djangosaml2idp_persistentid_sp_id_83e91899; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX djangosaml2idp_persistentid_sp_id_83e91899 ON public.djangosaml2idp_persistentid USING btree (sp_id);


--
-- Name: djangosaml2idp_persistentid_user_id_b2f3e033; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX djangosaml2idp_persistentid_user_id_b2f3e033 ON public.djangosaml2idp_persistentid USING btree (user_id);


--
-- Name: djangosaml2idp_serviceprovider_entity_id_089f0aaf_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX djangosaml2idp_serviceprovider_entity_id_089f0aaf_like ON public.djangosaml2idp_serviceprovider USING btree (entity_id varchar_pattern_ops);


--
-- Name: feed_sync_watermark_content_type_a7b99d3a_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX feed_sync_watermark_content_type_a7b99d3a_like ON public.feed_sync_watermark USING btree (content_type varchar_pattern_ops);


--
-- Name: files_directory_client_id_930fbefa; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX files_directory_client_id_930fbefa ON public.files_directory USING btree (client_id);


--
-- Name: files_directory_created_by_id_b9255055; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX files_directory_created_by_id_b9255055 ON public.files_directory USING btree (created_by_id);


--
-- Name: files_directory_parent_directory_id_e3160d61; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX files_directory_parent_directory_id_e3160d61 ON public.files_directory USING btree (parent_directory_id);


--
-- Name: files_directory_updated_by_id_7a9a4536; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX files_directory_updated_by_id_7a9a4536 ON public.files_directory USING btree (updated_by_id);


--
-- Name: files_file_client_id_d53390d8; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX files_file_client_id_d53390d8 ON public.files_file USING btree (client_id);


--
-- Name: files_file_created_by_id_18705c0e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX files_file_created_by_id_18705c0e ON public.files_file USING btree (created_by_id);


--
-- Name: files_file_parent_directory_id_8b813123; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX files_file_parent_directory_id_8b813123 ON public.files_file USING btree (parent_directory_id);


--
-- Name: files_file_updated_by_id_2cb8c87c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX files_file_updated_by_id_2cb8c87c ON public.files_file USING btree (updated_by_id);


--
-- Name: idx_feed_cache_lookup; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_feed_cache_lookup ON public.user_feed_cache USING btree (participant_identifier, feed_date DESC);


--
-- Name: industry_industry_name_a50f53fa_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX industry_industry_name_a50f53fa_like ON public.clients_industry USING btree (name text_pattern_ops);


--
-- Name: mdl_client__client__5af448_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mdl_client__client__5af448_idx ON public.mdl_client_custom_fields USING btree (client_id);


--
-- Name: mdl_client__client__abebaf_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mdl_client__client__abebaf_idx ON public.mdl_client_custom_field_values USING btree (client_id);


--
-- Name: mdl_client_custom_field_values_custom_field_id_e2155c5a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mdl_client_custom_field_values_custom_field_id_e2155c5a ON public.mdl_client_custom_field_values USING btree (custom_field_id);


--
-- Name: mdl_client_modules_config_client_module_id_eacec894; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mdl_client_modules_config_client_module_id_eacec894 ON public.mdl_client_modules_config USING btree (client_module_id);


--
-- Name: mdl_client_modules_parent_id_00da0636; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mdl_client_modules_parent_id_00da0636 ON public.mdl_client_modules USING btree (parent_id);


--
-- Name: mdl_partici_client__757d6e_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mdl_partici_client__757d6e_idx ON public.mdl_participant USING btree (client_id);


--
-- Name: mdl_partici_client__846ef2_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mdl_partici_client__846ef2_idx ON public.mdl_participants_phone USING btree (client_id);


--
-- Name: mdl_partici_client__cdd88b_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mdl_partici_client__cdd88b_idx ON public.mdl_participant_image USING btree (client_id);


--
-- Name: mdl_survey_option_bank_opt_mdlsurveyoptionbankoptions_756966d4; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mdl_survey_option_bank_opt_mdlsurveyoptionbankoptions_756966d4 ON public.mdl_survey_option_bank_options USING btree (mdlsurveyoptionbankoptions_id);


--
-- Name: mdl_survey_option_bank_opt_mdlsurveyoptionbankoptions_a6aff2a8; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mdl_survey_option_bank_opt_mdlsurveyoptionbankoptions_a6aff2a8 ON public.mdl_survey_option_bank_optionss_option_translations USING btree (mdlsurveyoptionbankoptions_id);


--
-- Name: mdl_survey_option_bank_opt_mdlsurveyoptionbankoptiont_3aca9bfa; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mdl_survey_option_bank_opt_mdlsurveyoptionbankoptiont_3aca9bfa ON public.mdl_survey_option_bank_optionss_option_translations USING btree (mdlsurveyoptionbankoptiontranslations_id);


--
-- Name: mdl_survey_option_bank_option_translations_language_id_8ebbe87c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mdl_survey_option_bank_option_translations_language_id_8ebbe87c ON public.mdl_survey_option_bank_option_translations USING btree (language_id);


--
-- Name: mdl_survey_option_bank_options_mdlsurveyoptionbank_id_09fa5ba8; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mdl_survey_option_bank_options_mdlsurveyoptionbank_id_09fa5ba8 ON public.mdl_survey_option_bank_options USING btree (mdlsurveyoptionbank_id);


--
-- Name: mdl_survey_option_bank_tit_mdlsurveyoptionbank_id_844d34ca; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mdl_survey_option_bank_tit_mdlsurveyoptionbank_id_844d34ca ON public.mdl_survey_option_bank_title_translations USING btree (mdlsurveyoptionbank_id);


--
-- Name: mdl_survey_option_bank_tit_mdlsurveyoptionbanktransla_069cc4e5; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mdl_survey_option_bank_tit_mdlsurveyoptionbanktransla_069cc4e5 ON public.mdl_survey_option_bank_title_translations USING btree (mdlsurveyoptionbanktranslations_id);


--
-- Name: mdl_survey_option_bank_translations_language_id_11f878c8; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mdl_survey_option_bank_translations_language_id_11f878c8 ON public.mdl_survey_option_bank_translations USING btree (language_id);


--
-- Name: mdl_wc_cont_client__3d57cf_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mdl_wc_cont_client__3d57cf_idx ON public.mdl_wc_contact_groups USING btree (client_id);


--
-- Name: mdl_wc_cont_client__3faab2_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mdl_wc_cont_client__3faab2_idx ON public.mdl_wc_contact_attachments USING btree (client_id);


--
-- Name: mdl_wc_contact_attachments_binary_content_id_40c323ea; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mdl_wc_contact_attachments_binary_content_id_40c323ea ON public.mdl_wc_contact_attachments USING btree (binary_content_id);


--
-- Name: mdl_wc_contact_group_translations_language_id_3b95f317; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mdl_wc_contact_group_translations_language_id_3b95f317 ON public.mdl_wc_contact_group_translations USING btree (language_id);


--
-- Name: mdl_wc_contact_groups_tran_mdlwccontactgroup_id_4d58ffff; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mdl_wc_contact_groups_tran_mdlwccontactgroup_id_4d58ffff ON public.mdl_wc_contact_groups_translations USING btree (mdlwccontactgroup_id);


--
-- Name: mdl_wc_contact_groups_tran_mdlwccontactgrouptranslati_deff7c9a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mdl_wc_contact_groups_tran_mdlwccontactgrouptranslati_deff7c9a ON public.mdl_wc_contact_groups_translations USING btree (mdlwccontactgrouptranslations_id);


--
-- Name: mdl_wc_part_client__380d31_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mdl_wc_part_client__380d31_idx ON public.mdl_wc_participant_contact_group_relation USING btree (client_id);


--
-- Name: mdl_wc_part_client__e5de40_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX mdl_wc_part_client__e5de40_idx ON public.mdl_wc_participant_custom_field_relation USING btree (client_id);


--
-- Name: participants_participant_groups_participant_id_f4f53abe; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX participants_participant_groups_participant_id_f4f53abe ON public.participants_participant_groups USING btree (participant_id);


--
-- Name: participants_participant_groups_participantgroups_id_1441c43b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX participants_participant_groups_participantgroups_id_1441c43b ON public.participants_participant_groups USING btree (participantgroups_id);


--
-- Name: payslip_client__3234c3_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payslip_client__3234c3_idx ON public.payslip USING btree (client_id, title, created_by, status);


--
-- Name: payslip_emp_payslip_0ae17c_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payslip_emp_payslip_0ae17c_idx ON public.payslip_employee USING btree (payslip_id, employee_id, identifier, phone_number);


--
-- Name: payslip_employee_payslip_id_39078d9f; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payslip_employee_payslip_id_39078d9f ON public.payslip_employee USING btree (payslip_id);


--
-- Name: payslip_generated_payslip_id_ac9baa41; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payslip_generated_payslip_id_ac9baa41 ON public.payslip_generated USING btree (payslip_id);


--
-- Name: payslip_task_id_f46d69fb; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payslip_task_id_f46d69fb ON public.payslip USING btree (task_id);


--
-- Name: payslip_task_id_f46d69fb_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payslip_task_id_f46d69fb_like ON public.payslip USING btree (task_id varchar_pattern_ops);


--
-- Name: payslip_upl_created_921e66_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payslip_upl_created_921e66_idx ON public.payslip_uploaded_file USING btree (created_date);


--
-- Name: shared_files_directory_client_id_be3b0b16; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shared_files_directory_client_id_be3b0b16 ON public.shared_files_directory USING btree (client_id);


--
-- Name: shared_files_directory_created_by_id_19b47f40; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shared_files_directory_created_by_id_19b47f40 ON public.shared_files_directory USING btree (created_by_id);


--
-- Name: shared_files_directory_parent_directory_id_28ee435f; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shared_files_directory_parent_directory_id_28ee435f ON public.shared_files_directory USING btree (parent_directory_id);


--
-- Name: shared_files_directory_updated_by_id_1015efb3; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shared_files_directory_updated_by_id_1015efb3 ON public.shared_files_directory USING btree (updated_by_id);


--
-- Name: shared_files_file_client_id_5462d6db; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shared_files_file_client_id_5462d6db ON public.shared_files_file USING btree (client_id);


--
-- Name: shared_files_file_created_by_id_9a37b81c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shared_files_file_created_by_id_9a37b81c ON public.shared_files_file USING btree (created_by_id);


--
-- Name: shared_files_file_parent_directory_id_4abe28fe; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shared_files_file_parent_directory_id_4abe28fe ON public.shared_files_file USING btree (parent_directory_id);


--
-- Name: shared_files_file_updated_by_id_473b0a5b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shared_files_file_updated_by_id_473b0a5b ON public.shared_files_file USING btree (updated_by_id);


--
-- Name: silk_profile_queries_profile_id_a3d76db8; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX silk_profile_queries_profile_id_a3d76db8 ON public.silk_profile_queries USING btree (profile_id);


--
-- Name: silk_profile_queries_sqlquery_id_155df455; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX silk_profile_queries_sqlquery_id_155df455 ON public.silk_profile_queries USING btree (sqlquery_id);


--
-- Name: silk_profile_request_id_7b81bd69; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX silk_profile_request_id_7b81bd69 ON public.silk_profile USING btree (request_id);


--
-- Name: silk_profile_request_id_7b81bd69_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX silk_profile_request_id_7b81bd69_like ON public.silk_profile USING btree (request_id varchar_pattern_ops);


--
-- Name: silk_request_id_5a356c4f_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX silk_request_id_5a356c4f_like ON public.silk_request USING btree (id varchar_pattern_ops);


--
-- Name: silk_request_path_9f3d798e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX silk_request_path_9f3d798e ON public.silk_request USING btree (path);


--
-- Name: silk_request_path_9f3d798e_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX silk_request_path_9f3d798e_like ON public.silk_request USING btree (path varchar_pattern_ops);


--
-- Name: silk_request_start_time_1300bc58; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX silk_request_start_time_1300bc58 ON public.silk_request USING btree (start_time);


--
-- Name: silk_request_view_name_68559f7b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX silk_request_view_name_68559f7b ON public.silk_request USING btree (view_name);


--
-- Name: silk_request_view_name_68559f7b_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX silk_request_view_name_68559f7b_like ON public.silk_request USING btree (view_name varchar_pattern_ops);


--
-- Name: silk_response_id_dda88710_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX silk_response_id_dda88710_like ON public.silk_response USING btree (id varchar_pattern_ops);


--
-- Name: silk_response_request_id_1e8e2776_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX silk_response_request_id_1e8e2776_like ON public.silk_response USING btree (request_id varchar_pattern_ops);


--
-- Name: silk_sqlquery_request_id_6f8f0527; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX silk_sqlquery_request_id_6f8f0527 ON public.silk_sqlquery USING btree (request_id);


--
-- Name: silk_sqlquery_request_id_6f8f0527_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX silk_sqlquery_request_id_6f8f0527_like ON public.silk_sqlquery USING btree (request_id varchar_pattern_ops);


--
-- Name: survey_mdlsurvey_active_la_supportedlanguages_id_9b8d6bf7; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurvey_active_la_supportedlanguages_id_9b8d6bf7 ON public.survey_mdlsurvey_active_languages USING btree (supportedlanguages_id);


--
-- Name: survey_mdlsurvey_active_languages_survey_id_f2111ba8; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurvey_active_languages_survey_id_f2111ba8 ON public.survey_mdlsurvey_active_languages USING btree (survey_id);


--
-- Name: survey_mdlsurvey_closing_message_id_3ffeb305; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurvey_closing_message_id_3ffeb305 ON public.survey_mdlsurvey USING btree (closing_message_id);


--
-- Name: survey_mdlsurvey_opening_message_id_6d63629e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurvey_opening_message_id_6d63629e ON public.survey_mdlsurvey USING btree (opening_message_id);


--
-- Name: survey_mdlsurvey_posters_mdlsurvey_id_b149abfa; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurvey_posters_mdlsurvey_id_b149abfa ON public.survey_mdlsurvey_posters USING btree (mdlsurvey_id);


--
-- Name: survey_mdlsurvey_posters_mdlsurveyposters_id_bf242b0c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurvey_posters_mdlsurveyposters_id_bf242b0c ON public.survey_mdlsurvey_posters USING btree (mdlsurveyposters_id);


--
-- Name: survey_mdlsurvey_questions_mdlsurvey_id_5b27b908; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurvey_questions_mdlsurvey_id_5b27b908 ON public.survey_mdlsurvey_questions USING btree (mdlsurvey_id);


--
-- Name: survey_mdlsurvey_questions_mdlsurveyquestions_id_833b90d6; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurvey_questions_mdlsurveyquestions_id_833b90d6 ON public.survey_mdlsurvey_questions USING btree (mdlsurveyquestions_id);


--
-- Name: survey_mdlsurvey_reporting_categories_mdlsurvey_id_abee8ba6; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurvey_reporting_categories_mdlsurvey_id_abee8ba6 ON public.survey_mdlsurvey_reporting_categories USING btree (mdlsurvey_id);


--
-- Name: survey_mdlsurvey_reporting_mdlsurveyreportingcategory_c4660726; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurvey_reporting_mdlsurveyreportingcategory_c4660726 ON public.survey_mdlsurvey_reporting_categories USING btree (mdlsurveyreportingcategory_id);


--
-- Name: survey_mdlsurvey_shared_clients_clientinfo_id_24771560; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurvey_shared_clients_clientinfo_id_24771560 ON public.survey_mdlsurvey_shared_clients USING btree (clientinfo_id);


--
-- Name: survey_mdlsurvey_shared_clients_mdlsurvey_id_9b780032; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurvey_shared_clients_mdlsurvey_id_9b780032 ON public.survey_mdlsurvey_shared_clients USING btree (mdlsurvey_id);


--
-- Name: survey_mdlsurvey_supported_languages_mdlsurvey_id_fcaefdfa; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurvey_supported_languages_mdlsurvey_id_fcaefdfa ON public.survey_mdlsurvey_supported_languages USING btree (mdlsurvey_id);


--
-- Name: survey_mdlsurvey_supported_mdlsupportedlanguages_id_9f74b6c0; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurvey_supported_mdlsupportedlanguages_id_9f74b6c0 ON public.survey_mdlsurvey_supported_languages USING btree (mdlsupportedlanguages_id);


--
-- Name: survey_mdlsurvey_template__mdlsurvey_id_85dc6c06; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurvey_template__mdlsurvey_id_85dc6c06 ON public.survey_mdlsurvey_template_supported_languages USING btree (mdlsurvey_id);


--
-- Name: survey_mdlsurvey_template__mdltemplate_supported_lang_80da2ce9; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurvey_template__mdltemplate_supported_lang_80da2ce9 ON public.survey_mdlsurvey_template_supported_languages USING btree (mdltemplate_supported_languages_id);


--
-- Name: survey_mdlsurvey_translati_mdlsurveytitletranslations_d2ac92e1; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurvey_translati_mdlsurveytitletranslations_d2ac92e1 ON public.survey_mdlsurvey_translations USING btree (mdlsurveytitletranslations_id);


--
-- Name: survey_mdlsurvey_translations_mdlsurvey_id_f545bb87; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurvey_translations_mdlsurvey_id_f545bb87 ON public.survey_mdlsurvey_translations USING btree (mdlsurvey_id);


--
-- Name: survey_mdlsurveyclientques_clientinfo_id_81d3f6c8; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyclientques_clientinfo_id_81d3f6c8 ON public.survey_mdlsurveyclientquestiontemplateconfig_client_id USING btree (clientinfo_id);


--
-- Name: survey_mdlsurveyclientques_mdlsurveyclientquestiontem_edf8cc4e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyclientques_mdlsurveyclientquestiontem_edf8cc4e ON public.survey_mdlsurveyclientquestiontemplateconfig_client_id USING btree (mdlsurveyclientquestiontemplateconfig_id);


--
-- Name: survey_mdlsurveyclientques_question_id_9d1fdf39; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyclientques_question_id_9d1fdf39 ON public.survey_mdlsurveyclientquestiontemplateconfig USING btree (question_id);


--
-- Name: survey_mdlsurveyclosingmes_mdlsurveyclosingmessage_id_87c7804e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyclosingmes_mdlsurveyclosingmessage_id_87c7804e ON public.survey_mdlsurveyclosingmessage_translation USING btree (mdlsurveyclosingmessage_id);


--
-- Name: survey_mdlsurveyclosingmes_mdlsurveyclosingmessagetra_53a50a46; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyclosingmes_mdlsurveyclosingmessagetra_53a50a46 ON public.survey_mdlsurveyclosingmessage_translation USING btree (mdlsurveyclosingmessagetranslations_id);


--
-- Name: survey_mdlsurveyclosingmessagetranslations_language_id_17423a4e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyclosingmessagetranslations_language_id_17423a4e ON public.survey_mdlsurveyclosingmessagetranslations USING btree (language_id);


--
-- Name: survey_mdlsurveyopeningmes_mdlsurveyopeningmessage_id_a54147e2; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyopeningmes_mdlsurveyopeningmessage_id_a54147e2 ON public.survey_mdlsurveyopeningmessage_translation USING btree (mdlsurveyopeningmessage_id);


--
-- Name: survey_mdlsurveyopeningmes_mdlsurveyopeningmessagetra_841a2dda; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyopeningmes_mdlsurveyopeningmessagetra_841a2dda ON public.survey_mdlsurveyopeningmessage_translation USING btree (mdlsurveyopeningmessagetranslations_id);


--
-- Name: survey_mdlsurveyopeningmessagetranslations_language_id_37da50ad; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyopeningmessagetranslations_language_id_37da50ad ON public.survey_mdlsurveyopeningmessagetranslations USING btree (language_id);


--
-- Name: survey_mdlsurveyquestionca_clientinfo_id_d9b32371; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyquestionca_clientinfo_id_d9b32371 ON public.survey_mdlsurveyquestioncategory_client_id USING btree (clientinfo_id);


--
-- Name: survey_mdlsurveyquestionca_mdlsurveyquestioncategory__ab49b5f5; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyquestionca_mdlsurveyquestioncategory__ab49b5f5 ON public.survey_mdlsurveyquestioncategory_client_id USING btree (mdlsurveyquestioncategory_id);


--
-- Name: survey_mdlsurveyquestioncategory_dic_key_744465df_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyquestioncategory_dic_key_744465df_like ON public.survey_mdlsurveyquestioncategory USING btree (dic_key text_pattern_ops);


--
-- Name: survey_mdlsurveyquestioncategory_name_ee81dc64_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyquestioncategory_name_ee81dc64_like ON public.survey_mdlsurveyquestioncategory USING btree (name text_pattern_ops);


--
-- Name: survey_mdlsurveyquestionop_clientinfo_id_b2b28ad2; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyquestionop_clientinfo_id_b2b28ad2 ON public.survey_mdlsurveyquestionoptionsmedia_client_id USING btree (clientinfo_id);


--
-- Name: survey_mdlsurveyquestionop_mdlsurveyquestionoptions_i_299dc37a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyquestionop_mdlsurveyquestionoptions_i_299dc37a ON public.survey_mdlsurveyquestionoptions_option_translations USING btree (mdlsurveyquestionoptions_id);


--
-- Name: survey_mdlsurveyquestionop_mdlsurveyquestionoptionsme_8eeb36b6; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyquestionop_mdlsurveyquestionoptionsme_8eeb36b6 ON public.survey_mdlsurveyquestionoptionsmedia_client_id USING btree (mdlsurveyquestionoptionsmedia_id);


--
-- Name: survey_mdlsurveyquestionop_mdlsurveyquestionoptiontra_f6ae72a2; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyquestionop_mdlsurveyquestionoptiontra_f6ae72a2 ON public.survey_mdlsurveyquestionoptions_option_translations USING btree (mdlsurveyquestionoptiontranslations_id);


--
-- Name: survey_mdlsurveyquestionoptionsmedia_question_id_d4be051e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyquestionoptionsmedia_question_id_d4be051e ON public.survey_mdlsurveyquestionoptionsmedia USING btree (question_id);


--
-- Name: survey_mdlsurveyquestionoptiontranslations_language_id_7fd982af; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyquestionoptiontranslations_language_id_7fd982af ON public.survey_mdlsurveyquestionoptiontranslations USING btree (language_id);


--
-- Name: survey_mdlsurveyquestionre_survey_user_response_id_6542c110; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyquestionre_survey_user_response_id_6542c110 ON public.survey_mdlsurveyquestionresponses USING btree (survey_user_response_id);


--
-- Name: survey_mdlsurveyquestionresponses_language_id_ea3d6252; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyquestionresponses_language_id_ea3d6252 ON public.survey_mdlsurveyquestionresponses USING btree (language_id);


--
-- Name: survey_mdlsurveyquestionresponses_question_option_id_01d9f60c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyquestionresponses_question_option_id_01d9f60c ON public.survey_mdlsurveyquestionresponses USING btree (question_option_id);


--
-- Name: survey_mdlsurveyquestionresponses_survey_id_1bbb53f7; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyquestionresponses_survey_id_1bbb53f7 ON public.survey_mdlsurveyquestionresponses USING btree (survey_id);


--
-- Name: survey_mdlsurveyquestionresponses_survey_question_id_3dd0ba5f; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyquestionresponses_survey_question_id_3dd0ba5f ON public.survey_mdlsurveyquestionresponses USING btree (survey_question_id);


--
-- Name: survey_mdlsurveyquestions__mdlsurveyquestionoptions_i_ad3cf73a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyquestions__mdlsurveyquestionoptions_i_ad3cf73a ON public.survey_mdlsurveyquestions_question_options USING btree (mdlsurveyquestionoptions_id);


--
-- Name: survey_mdlsurveyquestions__mdlsurveyquestions_id_a1e25359; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyquestions__mdlsurveyquestions_id_a1e25359 ON public.survey_mdlsurveyquestions_question_options USING btree (mdlsurveyquestions_id);


--
-- Name: survey_mdlsurveyquestions__mdlsurveyquestions_id_b1b38f42; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyquestions__mdlsurveyquestions_id_b1b38f42 ON public.survey_mdlsurveyquestions_reporting_categories USING btree (mdlsurveyquestions_id);


--
-- Name: survey_mdlsurveyquestions__mdlsurveyquestions_id_dc612f13; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyquestions__mdlsurveyquestions_id_dc612f13 ON public.survey_mdlsurveyquestions_translations USING btree (mdlsurveyquestions_id);


--
-- Name: survey_mdlsurveyquestions__mdlsurveyquestiontranslati_3c06a9b2; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyquestions__mdlsurveyquestiontranslati_3c06a9b2 ON public.survey_mdlsurveyquestions_translations USING btree (mdlsurveyquestiontranslations_id);


--
-- Name: survey_mdlsurveyquestions__mdlsurveyreportingcategory_947c6407; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyquestions__mdlsurveyreportingcategory_947c6407 ON public.survey_mdlsurveyquestions_reporting_categories USING btree (mdlsurveyreportingcategory_id);


--
-- Name: survey_mdlsurveyquestions_q_type_id_c7555507; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyquestions_q_type_id_c7555507 ON public.survey_mdlsurveyquestions USING btree (q_type_id);


--
-- Name: survey_mdlsurveyquestionte_clientinfo_id_11e58766; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyquestionte_clientinfo_id_11e58766 ON public.survey_mdlsurveyquestiontemplate_client_id USING btree (clientinfo_id);


--
-- Name: survey_mdlsurveyquestionte_clientinfo_id_1d05a07d; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyquestionte_clientinfo_id_1d05a07d ON public.survey_mdlsurveyquestiontemplatetranslations_client_id USING btree (clientinfo_id);


--
-- Name: survey_mdlsurveyquestionte_clientinfo_id_8dc07c37; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyquestionte_clientinfo_id_8dc07c37 ON public.survey_mdlsurveyquestiontemplatetypeconfig_client_id USING btree (clientinfo_id);


--
-- Name: survey_mdlsurveyquestionte_clientinfo_id_9c90f976; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyquestionte_clientinfo_id_9c90f976 ON public.survey_mdlsurveyquestiontemplatemedia_client_id USING btree (clientinfo_id);


--
-- Name: survey_mdlsurveyquestionte_mdlsurveyquestiontemplate__3cb439ea; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyquestionte_mdlsurveyquestiontemplate__3cb439ea ON public.survey_mdlsurveyquestiontemplate_client_id USING btree (mdlsurveyquestiontemplate_id);


--
-- Name: survey_mdlsurveyquestionte_mdlsurveyquestiontemplatem_fc371104; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyquestionte_mdlsurveyquestiontemplatem_fc371104 ON public.survey_mdlsurveyquestiontemplatemedia_client_id USING btree (mdlsurveyquestiontemplatemedia_id);


--
-- Name: survey_mdlsurveyquestionte_mdlsurveyquestiontemplatet_19b20dd0; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyquestionte_mdlsurveyquestiontemplatet_19b20dd0 ON public.survey_mdlsurveyquestiontemplatetranslations_client_id USING btree (mdlsurveyquestiontemplatetranslations_id);


--
-- Name: survey_mdlsurveyquestionte_mdlsurveyquestiontemplatet_faa9ddd4; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyquestionte_mdlsurveyquestiontemplatet_faa9ddd4 ON public.survey_mdlsurveyquestiontemplatetypeconfig_client_id USING btree (mdlsurveyquestiontemplatetypeconfig_id);


--
-- Name: survey_mdlsurveyquestionte_question_id_b47bf7fa; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyquestionte_question_id_b47bf7fa ON public.survey_mdlsurveyquestiontemplatetranslations USING btree (question_id);


--
-- Name: survey_mdlsurveyquestiontemplatemedia_question_id_c0d153f2; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyquestiontemplatemedia_question_id_c0d153f2 ON public.survey_mdlsurveyquestiontemplatemedia USING btree (question_id);


--
-- Name: survey_mdlsurveyquestiontemplatetypeconfig_question_id_7a54502d; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyquestiontemplatetypeconfig_question_id_7a54502d ON public.survey_mdlsurveyquestiontemplatetypeconfig USING btree (question_id);


--
-- Name: survey_mdlsurveyquestiontranslations_language_id_bc9ae72c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyquestiontranslations_language_id_bc9ae72c ON public.survey_mdlsurveyquestiontranslations USING btree (language_id);


--
-- Name: survey_mdlsurveyquestiontype_dic_key_88b22ab6_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyquestiontype_dic_key_88b22ab6_like ON public.survey_mdlsurveyquestiontype USING btree (dic_key text_pattern_ops);


--
-- Name: survey_mdlsurveyquestiontypeoptions_type_id_05cab515; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyquestiontypeoptions_type_id_05cab515 ON public.survey_mdlsurveyquestiontypeoptions USING btree (type_id);


--
-- Name: survey_mdlsurveyreportingc_language_id_9d189398; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyreportingc_language_id_9d189398 ON public.survey_mdlsurveyreportingcategorytranslations USING btree (language_id);


--
-- Name: survey_mdlsurveyreportingc_mdlsupportedlanguages_id_c0607f69; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyreportingc_mdlsupportedlanguages_id_c0607f69 ON public.survey_mdlsurveyreportingcategory_supported_languages USING btree (mdlsupportedlanguages_id);


--
-- Name: survey_mdlsurveyreportingc_mdlsurveyreportingcategory_542c6b04; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyreportingc_mdlsurveyreportingcategory_542c6b04 ON public.survey_mdlsurveyreportingcategory_translations USING btree (mdlsurveyreportingcategorytranslations_id);


--
-- Name: survey_mdlsurveyreportingc_mdlsurveyreportingcategory_81656a76; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyreportingc_mdlsurveyreportingcategory_81656a76 ON public.survey_mdlsurveyreportingcategory_translations USING btree (mdlsurveyreportingcategory_id);


--
-- Name: survey_mdlsurveyreportingc_mdlsurveyreportingcategory_90a8174a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyreportingc_mdlsurveyreportingcategory_90a8174a ON public.survey_mdlsurveyreportingcategory_supported_languages USING btree (mdlsurveyreportingcategory_id);


--
-- Name: survey_mdlsurveytemplate_p_mdlsurveytemplateposters_i_6c4d7595; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveytemplate_p_mdlsurveytemplateposters_i_6c4d7595 ON public.survey_mdlsurveytemplate_posters USING btree (mdlsurveytemplateposters_id);


--
-- Name: survey_mdlsurveytemplate_posters_mdlsurveytemplate_id_415c5d4b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveytemplate_posters_mdlsurveytemplate_id_415c5d4b ON public.survey_mdlsurveytemplate_posters USING btree (mdlsurveytemplate_id);


--
-- Name: survey_mdlsurveytemplate_q_mdlsurveytemplate_id_5df504e7; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveytemplate_q_mdlsurveytemplate_id_5df504e7 ON public.survey_mdlsurveytemplate_questions USING btree (mdlsurveytemplate_id);


--
-- Name: survey_mdlsurveytemplate_q_mdlsurveytemplatequestion__4e441fc2; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveytemplate_q_mdlsurveytemplatequestion__4e441fc2 ON public.survey_mdlsurveytemplate_questions USING btree (mdlsurveytemplatequestion_id);


--
-- Name: survey_mdlsurveytemplate_r_mdlsurveyreportingcategory_e6b22b82; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveytemplate_r_mdlsurveyreportingcategory_e6b22b82 ON public.survey_mdlsurveytemplate_reporting_categories USING btree (mdlsurveyreportingcategory_id);


--
-- Name: survey_mdlsurveytemplate_r_mdlsurveytemplate_id_34bee454; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveytemplate_r_mdlsurveytemplate_id_34bee454 ON public.survey_mdlsurveytemplate_reporting_categories USING btree (mdlsurveytemplate_id);


--
-- Name: survey_mdlsurveytemplate_s_mdlsupportedlanguages_id_6aac5a58; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveytemplate_s_mdlsupportedlanguages_id_6aac5a58 ON public.survey_mdlsurveytemplate_supported_languages USING btree (mdlsupportedlanguages_id);


--
-- Name: survey_mdlsurveytemplate_s_mdlsurveytemplate_id_87f61550; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveytemplate_s_mdlsurveytemplate_id_87f61550 ON public.survey_mdlsurveytemplate_shared_clients USING btree (mdlsurveytemplate_id);


--
-- Name: survey_mdlsurveytemplate_s_mdlsurveytemplate_id_f4e315b0; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveytemplate_s_mdlsurveytemplate_id_f4e315b0 ON public.survey_mdlsurveytemplate_supported_languages USING btree (mdlsurveytemplate_id);


--
-- Name: survey_mdlsurveytemplate_shared_clients_clientinfo_id_2ef57e92; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveytemplate_shared_clients_clientinfo_id_2ef57e92 ON public.survey_mdlsurveytemplate_shared_clients USING btree (clientinfo_id);


--
-- Name: survey_mdlsurveytemplate_t_mdlsurveytemplate_id_ca777186; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveytemplate_t_mdlsurveytemplate_id_ca777186 ON public.survey_mdlsurveytemplate_translations USING btree (mdlsurveytemplate_id);


--
-- Name: survey_mdlsurveytemplate_t_mdlsurveytemplatetranslati_88e3b822; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveytemplate_t_mdlsurveytemplatetranslati_88e3b822 ON public.survey_mdlsurveytemplate_translations USING btree (mdlsurveytemplatetranslations_id);


--
-- Name: survey_mdlsurveytemplatequ_language_id_9798ffc2; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveytemplatequ_language_id_9798ffc2 ON public.survey_mdlsurveytemplatequestiontranslations USING btree (language_id);


--
-- Name: survey_mdlsurveytemplatequ_language_id_d84142e3; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveytemplatequ_language_id_d84142e3 ON public.survey_mdlsurveytemplatequestionoptionstranslations USING btree (language_id);


--
-- Name: survey_mdlsurveytemplatequ_mdlsurveyreportingcategory_a9b0e193; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveytemplatequ_mdlsurveyreportingcategory_a9b0e193 ON public.survey_mdlsurveytemplatequestion_reporting_categories USING btree (mdlsurveyreportingcategory_id);


--
-- Name: survey_mdlsurveytemplatequ_mdlsurveytemplatequestion__2a50eacf; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveytemplatequ_mdlsurveytemplatequestion__2a50eacf ON public.survey_mdlsurveytemplatequestion_translations USING btree (mdlsurveytemplatequestion_id);


--
-- Name: survey_mdlsurveytemplatequ_mdlsurveytemplatequestion__5119728e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveytemplatequ_mdlsurveytemplatequestion__5119728e ON public.survey_mdlsurveytemplatequestion_question_options USING btree (mdlsurveytemplatequestion_id);


--
-- Name: survey_mdlsurveytemplatequ_mdlsurveytemplatequestion__d2f4747a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveytemplatequ_mdlsurveytemplatequestion__d2f4747a ON public.survey_mdlsurveytemplatequestion_reporting_categories USING btree (mdlsurveytemplatequestion_id);


--
-- Name: survey_mdlsurveytemplatequ_mdlsurveytemplatequestiono_1b0d1e49; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveytemplatequ_mdlsurveytemplatequestiono_1b0d1e49 ON public.survey_mdlsurveytemplatequestionoptions_option_translations USING btree (mdlsurveytemplatequestionoptionstranslations_id);


--
-- Name: survey_mdlsurveytemplatequ_mdlsurveytemplatequestiono_31a81c5f; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveytemplatequ_mdlsurveytemplatequestiono_31a81c5f ON public.survey_mdlsurveytemplatequestion_question_options USING btree (mdlsurveytemplatequestionoptions_id);


--
-- Name: survey_mdlsurveytemplatequ_mdlsurveytemplatequestiono_fba0efa8; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveytemplatequ_mdlsurveytemplatequestiono_fba0efa8 ON public.survey_mdlsurveytemplatequestionoptions_option_translations USING btree (mdlsurveytemplatequestionoptions_id);


--
-- Name: survey_mdlsurveytemplatequ_mdlsurveytemplatequestiont_7d1165c3; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveytemplatequ_mdlsurveytemplatequestiont_7d1165c3 ON public.survey_mdlsurveytemplatequestion_translations USING btree (mdlsurveytemplatequestiontranslations_id);


--
-- Name: survey_mdlsurveytemplatequestion_q_type_id_601d8f4a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveytemplatequestion_q_type_id_601d8f4a ON public.survey_mdlsurveytemplatequestion USING btree (q_type_id);


--
-- Name: survey_mdlsurveytemplatetranslations_language_id_e5b0e059; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveytemplatetranslations_language_id_e5b0e059 ON public.survey_mdlsurveytemplatetranslations USING btree (language_id);


--
-- Name: survey_mdlsurveytitletranslations_language_id_d4eae627; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveytitletranslations_language_id_d4eae627 ON public.survey_mdlsurveytitletranslations USING btree (language_id);


--
-- Name: survey_mdlsurveyuserresponses_language_id_79d86634; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyuserresponses_language_id_79d86634 ON public.survey_mdlsurveyuserresponses USING btree (language_id);


--
-- Name: survey_mdlsurveyuserresponses_survey_id_id_07f101c0; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_mdlsurveyuserresponses_survey_id_id_07f101c0 ON public.survey_mdlsurveyuserresponses USING btree (survey_id_id);


--
-- Name: survey_surveyhistory_survey_id_34874e4f; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_surveyhistory_survey_id_34874e4f ON public.survey_surveyhistory USING btree (survey_id);


--
-- Name: survey_surveyinvite_survey_id_ffed5651; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_surveyinvite_survey_id_ffed5651 ON public.survey_surveyinvite USING btree (survey_id);


--
-- Name: survey_surveyinvite_task_id_4593a8d4; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_surveyinvite_task_id_4593a8d4 ON public.survey_surveyinvite USING btree (task_id);


--
-- Name: survey_surveyinvite_task_id_4593a8d4_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_surveyinvite_task_id_4593a8d4_like ON public.survey_surveyinvite USING btree (task_id varchar_pattern_ops);


--
-- Name: survey_surveyinvitesworkers_survey_id_3d210cb4; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_surveyinvitesworkers_survey_id_3d210cb4 ON public.survey_surveyinvitesworkers USING btree (survey_id);


--
-- Name: survey_surveyinvitesworkers_survey_invite_id_d203f551; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_surveyinvitesworkers_survey_invite_id_d203f551 ON public.survey_surveyinvitesworkers USING btree (survey_invite_id);


--
-- Name: survey_template_active_languages_supportedlanguages_id_b953a33a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_template_active_languages_supportedlanguages_id_b953a33a ON public.survey_template_active_languages USING btree (supportedlanguages_id);


--
-- Name: survey_template_active_languages_surveytemplate_id_0b735013; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX survey_template_active_languages_surveytemplate_id_0b735013 ON public.survey_template_active_languages USING btree (surveytemplate_id);


--
-- Name: translations_mdlsupportedl_mdllanguagefonts_id_fcb35fc2; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX translations_mdlsupportedl_mdllanguagefonts_id_fcb35fc2 ON public.translations_mdlsupportedlanguages_fonts USING btree (mdllanguagefonts_id);


--
-- Name: translations_mdlsupportedl_mdlsupportedlanguages_id_6025b0d9; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX translations_mdlsupportedl_mdlsupportedlanguages_id_6025b0d9 ON public.translations_mdlsupportedlanguages_fonts USING btree (mdlsupportedlanguages_id);


--
-- Name: translations_mdltranslations_dictionary_id_c5151075; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX translations_mdltranslations_dictionary_id_c5151075 ON public.translations_mdltranslations USING btree (dictionary_id);


--
-- Name: translations_mdltranslations_language_id_2879f799; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX translations_mdltranslations_language_id_2879f799 ON public.translations_mdltranslations USING btree (language_id);


--
-- Name: user_feed_cache_feed_date_6a26b283; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_feed_cache_feed_date_6a26b283 ON public.user_feed_cache USING btree (feed_date);


--
-- Name: user_first_name_gin_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_first_name_gin_idx ON public.authentication_user USING gin (upper((first_name)::text) public.gin_trgm_ops);


--
-- Name: user_last_name_gin_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_last_name_gin_idx ON public.authentication_user USING gin (upper((last_name)::text) public.gin_trgm_ops);


--
-- Name: user_roles_mdluseraccessmodule_parent_id_9a76785f; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_roles_mdluseraccessmodule_parent_id_9a76785f ON public.user_roles_mdluseraccessmodule USING btree (parent_id);


--
-- Name: user_roles_mdluseraccessrole_parent_id_64c76caa; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_roles_mdluseraccessrole_parent_id_64c76caa ON public.user_roles_mdluseraccessrole USING btree (parent_id);


--
-- Name: user_roles_mdluseraccessrolemoduleconfig_module_id_id_c14c343c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_roles_mdluseraccessrolemoduleconfig_module_id_id_c14c343c ON public.user_roles_mdluseraccessrolemoduleconfig USING btree (module_id_id);


--
-- Name: user_roles_mdluseraccessrolemoduleconfig_role_id_id_248d3eea; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_roles_mdluseraccessrolemoduleconfig_role_id_id_248d3eea ON public.user_roles_mdluseraccessrolemoduleconfig USING btree (role_id_id);


--
-- Name: user_roles_mdluseraccessuserroleconfig_role_id_id_a5164b58; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_roles_mdluseraccessuserroleconfig_role_id_id_a5164b58 ON public.user_roles_mdluseraccessuserroleconfig USING btree (role_id_id);


--
-- Name: user_settings_mdlusersettings_language_id_44cb60ad; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_settings_mdlusersettings_language_id_44cb60ad ON public.user_settings_mdlusersettings USING btree (language_id);


--
-- Name: user_settings_mdlusersettings_preferred_font_id_94ddfd18; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_settings_mdlusersettings_preferred_font_id_94ddfd18 ON public.user_settings_mdlusersettings USING btree (preferred_font_id);


--
-- Name: user_username_gin_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_username_gin_idx ON public.authentication_user USING gin (upper((username)::text) public.gin_trgm_ops);


--
-- Name: worker_cont_client__3a774a_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX worker_cont_client__3a774a_idx ON public.worker_contact_resetcontactregistration USING btree (client_id);


--
-- Name: worker_cont_created_1b5fdc_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX worker_cont_created_1b5fdc_idx ON public.worker_contact_resetcontactregistration USING btree (created_by);


--
-- Name: worker_cont_created_77058d_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX worker_cont_created_77058d_idx ON public.worker_contact_resetcontactregistration USING btree (created_date);


--
-- Name: worker_cont_name_d00a79_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX worker_cont_name_d00a79_idx ON public.worker_contact_resetcontactregistrationfile USING btree (name);


--
-- Name: worker_cont_status_18d0d1_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX worker_cont_status_18d0d1_idx ON public.worker_contact_resetcontactregistration USING btree (status);


--
-- Name: worker_contact_resetcontactregistration_task_id_c242d215; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX worker_contact_resetcontactregistration_task_id_c242d215 ON public.worker_contact_resetcontactregistration USING btree (task_id);


--
-- Name: worker_contact_resetcontactregistration_task_id_c242d215_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX worker_contact_resetcontactregistration_task_id_c242d215_like ON public.worker_contact_resetcontactregistration USING btree (task_id varchar_pattern_ops);


--
-- Name: wovo_import_mdlclientusers_client_id_064d30d5; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX wovo_import_mdlclientusers_client_id_064d30d5 ON public.wovo_import_mdlclientusers USING btree (client_id);


--
-- Name: wovo_import_mdlclientusers_user_id_aad1214f; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX wovo_import_mdlclientusers_user_id_aad1214f ON public.wovo_import_mdlclientusers USING btree (user_id);


--
-- Name: wovo_import_mdluser_groups_group_id_b902416b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX wovo_import_mdluser_groups_group_id_b902416b ON public.wovo_import_mdluser_groups USING btree (group_id);


--
-- Name: wovo_import_mdluser_groups_mdluser_id_0c5665d0; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX wovo_import_mdluser_groups_mdluser_id_0c5665d0 ON public.wovo_import_mdluser_groups USING btree (mdluser_id);


--
-- Name: wovo_import_mdluser_user_permissions_mdluser_id_fd656b3c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX wovo_import_mdluser_user_permissions_mdluser_id_fd656b3c ON public.wovo_import_mdluser_user_permissions USING btree (mdluser_id);


--
-- Name: wovo_import_mdluser_user_permissions_permission_id_4b478700; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX wovo_import_mdluser_user_permissions_permission_id_4b478700 ON public.wovo_import_mdluser_user_permissions USING btree (permission_id);


--
-- Name: account_managers_mdlaccountmanagers_countries account_managers_mdl_mdlaccountmanagers_i_423991ce_fk_account_m; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_managers_mdlaccountmanagers_countries
    ADD CONSTRAINT account_managers_mdl_mdlaccountmanagers_i_423991ce_fk_account_m FOREIGN KEY (mdlaccountmanagers_id) REFERENCES public.account_managers_mdlaccountmanagers(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: account_managers_mdlaccountmanagers_countries account_managers_mdl_mdlaccountmanagersco_e24fd273_fk_account_m; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_managers_mdlaccountmanagers_countries
    ADD CONSTRAINT account_managers_mdl_mdlaccountmanagersco_e24fd273_fk_account_m FOREIGN KEY (mdlaccountmanagerscountry_id) REFERENCES public.account_managers_mdlaccountmanagerscountry(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: auth_group_permissions auth_group_permissio_permission_id_84c5c92e_fk_auth_perm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissio_permission_id_84c5c92e_fk_auth_perm FOREIGN KEY (permission_id) REFERENCES public.auth_permission(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: auth_group_permissions auth_group_permissions_group_id_b120cbf9_fk_auth_group_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_group_id_b120cbf9_fk_auth_group_id FOREIGN KEY (group_id) REFERENCES public.auth_group(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: auth_permission auth_permission_content_type_id_2f476e4b_fk_django_co; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_content_type_id_2f476e4b_fk_django_co FOREIGN KEY (content_type_id) REFERENCES public.django_content_type(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: authentication_contactinfo authentication_conta_user_id_07b0e514_fk_authentic; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_contactinfo
    ADD CONSTRAINT authentication_conta_user_id_07b0e514_fk_authentic FOREIGN KEY (user_id) REFERENCES public.authentication_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: authentication_modulemappingfornet authentication_modul_module_id_0425a7ce_fk_authentic; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_modulemappingfornet
    ADD CONSTRAINT authentication_modul_module_id_0425a7ce_fk_authentic FOREIGN KEY (module_id) REFERENCES public.authentication_module(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: authentication_module authentication_modul_parent_id_1e58a022_fk_authentic; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_module
    ADD CONSTRAINT authentication_modul_parent_id_1e58a022_fk_authentic FOREIGN KEY (parent_id) REFERENCES public.authentication_module(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: authentication_role authentication_role_parent_id_a555eb83_fk_authentic; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_role
    ADD CONSTRAINT authentication_role_parent_id_a555eb83_fk_authentic FOREIGN KEY (parent_id) REFERENCES public.authentication_role(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: authentication_roleassociatedmodule authentication_rolea_module_id_e90c36b0_fk_authentic; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_roleassociatedmodule
    ADD CONSTRAINT authentication_rolea_module_id_e90c36b0_fk_authentic FOREIGN KEY (module_id) REFERENCES public.authentication_module(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: authentication_roleassociatedmodule authentication_rolea_role_id_e5fc45a3_fk_authentic; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_roleassociatedmodule
    ADD CONSTRAINT authentication_rolea_role_id_e5fc45a3_fk_authentic FOREIGN KEY (role_id) REFERENCES public.authentication_role(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: authentication_user_user_permissions authentication_user__permission_id_ea6be19a_fk_auth_perm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_user_user_permissions
    ADD CONSTRAINT authentication_user__permission_id_ea6be19a_fk_auth_perm FOREIGN KEY (permission_id) REFERENCES public.auth_permission(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: authentication_user_groups authentication_user__user_id_30868577_fk_authentic; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_user_groups
    ADD CONSTRAINT authentication_user__user_id_30868577_fk_authentic FOREIGN KEY (user_id) REFERENCES public.authentication_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: authentication_user_user_permissions authentication_user__user_id_736ebf7e_fk_authentic; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_user_user_permissions
    ADD CONSTRAINT authentication_user__user_id_736ebf7e_fk_authentic FOREIGN KEY (user_id) REFERENCES public.authentication_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: authentication_user authentication_user_current_client_info__6c94e6ff_fk_clients_c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_user
    ADD CONSTRAINT authentication_user_current_client_info__6c94e6ff_fk_clients_c FOREIGN KEY (current_client_info_id) REFERENCES public.clients_clientinfo(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: authentication_user_groups authentication_user_groups_group_id_6b5c44b7_fk_auth_group_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_user_groups
    ADD CONSTRAINT authentication_user_groups_group_id_6b5c44b7_fk_auth_group_id FOREIGN KEY (group_id) REFERENCES public.auth_group(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: authentication_user authentication_user_role_id_24664e00_fk_authentication_role_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_user
    ADD CONSTRAINT authentication_user_role_id_24664e00_fk_authentication_role_id FOREIGN KEY (role_id) REFERENCES public.authentication_role(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: authentication_userassociateddevice authentication_usera_avatar_id_fefa4054_fk_authentic; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_userassociateddevice
    ADD CONSTRAINT authentication_usera_avatar_id_fefa4054_fk_authentic FOREIGN KEY (avatar_id) REFERENCES public.authentication_avatar(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: authentication_userassociatedclient authentication_usera_client_info_id_1fcb3245_fk_clients_c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_userassociatedclient
    ADD CONSTRAINT authentication_usera_client_info_id_1fcb3245_fk_clients_c FOREIGN KEY (client_info_id) REFERENCES public.clients_clientinfo(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: authentication_userassociateddevice authentication_usera_secret_question_id_ff11eb67_fk_authentic; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_userassociateddevice
    ADD CONSTRAINT authentication_usera_secret_question_id_ff11eb67_fk_authentic FOREIGN KEY (secret_question_id) REFERENCES public.authentication_secretquestion(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: authentication_usersettings authentication_users_language_id_6d0fdb31_fk_translati; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_usersettings
    ADD CONSTRAINT authentication_users_language_id_6d0fdb31_fk_translati FOREIGN KEY (language_id) REFERENCES public.translations_mdlsupportedlanguages(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: authentication_usersettings authentication_users_preferred_font_id_b8a3183f_fk_mdl_langu; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.authentication_usersettings
    ADD CONSTRAINT authentication_users_preferred_font_id_b8a3183f_fk_mdl_langu FOREIGN KEY (preferred_font_id) REFERENCES public.mdl_language_fonts(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: client_modules_modulemappingfornet client_modules_modul_module_id_78b91cbb_fk_mdl_clien; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_modules_modulemappingfornet
    ADD CONSTRAINT client_modules_modul_module_id_78b91cbb_fk_mdl_clien FOREIGN KEY (module_id) REFERENCES public.mdl_client_modules(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: clients_clientinfo clients_clientinfo_app_channel_id_d4563a26_fk_clients_a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients_clientinfo
    ADD CONSTRAINT clients_clientinfo_app_channel_id_d4563a26_fk_clients_a FOREIGN KEY (app_channel_id) REFERENCES public.clients_appchannels(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: clients_clientinfo_client_pic clients_clientinfo_c_clientinfo_id_1d503374_fk_clients_c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients_clientinfo_client_pic
    ADD CONSTRAINT clients_clientinfo_c_clientinfo_id_1d503374_fk_clients_c FOREIGN KEY (clientinfo_id) REFERENCES public.clients_clientinfo(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: clients_clientinfo_client_pic clients_clientinfo_c_clientpic_id_3ac880d7_fk_clients_c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients_clientinfo_client_pic
    ADD CONSTRAINT clients_clientinfo_c_clientpic_id_3ac880d7_fk_clients_c FOREIGN KEY (clientpic_id) REFERENCES public.clients_clientpic(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: clients_clientinfo clients_clientinfo_country_mapping_id_6a96a79b_fk_mdl_count; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients_clientinfo
    ADD CONSTRAINT clients_clientinfo_country_mapping_id_6a96a79b_fk_mdl_count FOREIGN KEY (country_mapping_id) REFERENCES public.clients_country(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: clients_clientinfo_dashboard_type clients_clientinfo_d_clientinfo_id_af7b1d57_fk_clients_c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients_clientinfo_dashboard_type
    ADD CONSTRAINT clients_clientinfo_d_clientinfo_id_af7b1d57_fk_clients_c FOREIGN KEY (clientinfo_id) REFERENCES public.clients_clientinfo(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: clients_clientinfo_dashboard_type clients_clientinfo_d_dashboardtype_id_c5ee8c09_fk_clients_d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients_clientinfo_dashboard_type
    ADD CONSTRAINT clients_clientinfo_d_dashboardtype_id_c5ee8c09_fk_clients_d FOREIGN KEY (dashboardtype_id) REFERENCES public.clients_dashboardtype(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: clients_clientinfotorelationmapping clients_clientinfo_r_clientinfo_id_c8b57958_fk_clients_c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients_clientinfotorelationmapping
    ADD CONSTRAINT clients_clientinfo_r_clientinfo_id_c8b57958_fk_clients_c FOREIGN KEY (clientinfo_id) REFERENCES public.clients_clientinfo(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: clients_clientinfotorelationmapping clients_clientinfo_r_clientrelation_id_ad617af0_fk_clients_c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients_clientinfotorelationmapping
    ADD CONSTRAINT clients_clientinfo_r_clientrelation_id_ad617af0_fk_clients_c FOREIGN KEY (clientrelation_id) REFERENCES public.clients_clientrelation(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: clients_clientinfo_secondary_languages clients_clientinfo_s_clientinfo_id_983654ae_fk_clients_c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients_clientinfo_secondary_languages
    ADD CONSTRAINT clients_clientinfo_s_clientinfo_id_983654ae_fk_clients_c FOREIGN KEY (clientinfo_id) REFERENCES public.clients_clientinfo(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: clients_clientinfo_secondary_languages clients_clientinfo_s_secondarylanguages_i_ab88ef0d_fk_clients_s; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients_clientinfo_secondary_languages
    ADD CONSTRAINT clients_clientinfo_s_secondarylanguages_i_ab88ef0d_fk_clients_s FOREIGN KEY (secondarylanguages_id) REFERENCES public.clients_secondarylanguages(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: clients_clientinfoassociatedmodule clients_clientinfoas_client_info_id_47eafe5b_fk_clients_c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients_clientinfoassociatedmodule
    ADD CONSTRAINT clients_clientinfoas_client_info_id_47eafe5b_fk_clients_c FOREIGN KEY (client_info_id) REFERENCES public.clients_clientinfo(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: clients_clientinfoassociatedmodule clients_clientinfoas_module_id_a4b1a839_fk_authentic; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients_clientinfoassociatedmodule
    ADD CONSTRAINT clients_clientinfoas_module_id_a4b1a839_fk_authentic FOREIGN KEY (module_id) REFERENCES public.authentication_module(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: clients_clientinfocustomfielddata clients_clientinfocu_clientinfo_id_223fcbb6_fk_clients_c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients_clientinfocustomfielddata
    ADD CONSTRAINT clients_clientinfocu_clientinfo_id_223fcbb6_fk_clients_c FOREIGN KEY (clientinfo_id) REFERENCES public.clients_clientinfo(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: clients_clientinfocustomfielddata clients_clientinfocu_custom_field_id_b0e2087a_fk_clients_c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients_clientinfocustomfielddata
    ADD CONSTRAINT clients_clientinfocu_custom_field_id_b0e2087a_fk_clients_c FOREIGN KEY (custom_field_id) REFERENCES public.clients_customfield(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: clients_clientinfotolanguagesmapping clients_clientinfoto_clientinfo_id_07337c13_fk_clients_c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients_clientinfotolanguagesmapping
    ADD CONSTRAINT clients_clientinfoto_clientinfo_id_07337c13_fk_clients_c FOREIGN KEY (clientinfo_id) REFERENCES public.clients_clientinfo(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: clients_clientinfotoindustriesmapping clients_clientinfoto_clientinfo_id_a1cc97ea_fk_clients_c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients_clientinfotoindustriesmapping
    ADD CONSTRAINT clients_clientinfoto_clientinfo_id_a1cc97ea_fk_clients_c FOREIGN KEY (clientinfo_id) REFERENCES public.clients_clientinfo(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: clients_clientinfotoindustriesmapping clients_clientinfoto_industry_id_50185ccd_fk_clients_i; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients_clientinfotoindustriesmapping
    ADD CONSTRAINT clients_clientinfoto_industry_id_50185ccd_fk_clients_i FOREIGN KEY (industry_id) REFERENCES public.clients_industry(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: clients_clientinfotolanguagesmapping clients_clientinfoto_language_id_03154706_fk_translati; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients_clientinfotolanguagesmapping
    ADD CONSTRAINT clients_clientinfoto_language_id_03154706_fk_translati FOREIGN KEY (language_id) REFERENCES public.translations_mdlsupportedlanguages(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: clients_customfield clients_customfield_clientinfo_id_51bf1329_fk_clients_c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients_customfield
    ADD CONSTRAINT clients_customfield_clientinfo_id_51bf1329_fk_clients_c FOREIGN KEY (clientinfo_id) REFERENCES public.clients_clientinfo(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: clients_optionvalue clients_optionvalue_custom_field_id_896f0a9f_fk_clients_c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients_optionvalue
    ADD CONSTRAINT clients_optionvalue_custom_field_id_896f0a9f_fk_clients_c FOREIGN KEY (custom_field_id) REFERENCES public.clients_customfield(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: django_admin_log django_admin_log_content_type_id_c4bce8eb_fk_django_co; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_content_type_id_c4bce8eb_fk_django_co FOREIGN KEY (content_type_id) REFERENCES public.django_content_type(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: django_celery_beat_periodictask django_celery_beat_p_clocked_id_47a69f82_fk_django_ce; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_celery_beat_periodictask
    ADD CONSTRAINT django_celery_beat_p_clocked_id_47a69f82_fk_django_ce FOREIGN KEY (clocked_id) REFERENCES public.django_celery_beat_clockedschedule(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: django_celery_beat_periodictask django_celery_beat_p_crontab_id_d3cba168_fk_django_ce; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_celery_beat_periodictask
    ADD CONSTRAINT django_celery_beat_p_crontab_id_d3cba168_fk_django_ce FOREIGN KEY (crontab_id) REFERENCES public.django_celery_beat_crontabschedule(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: django_celery_beat_periodictask django_celery_beat_p_interval_id_a8ca27da_fk_django_ce; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_celery_beat_periodictask
    ADD CONSTRAINT django_celery_beat_p_interval_id_a8ca27da_fk_django_ce FOREIGN KEY (interval_id) REFERENCES public.django_celery_beat_intervalschedule(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: django_celery_beat_periodictask django_celery_beat_p_solar_id_a87ce72c_fk_django_ce; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_celery_beat_periodictask
    ADD CONSTRAINT django_celery_beat_p_solar_id_a87ce72c_fk_django_ce FOREIGN KEY (solar_id) REFERENCES public.django_celery_beat_solarschedule(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: djangosaml2idp_persistentid djangosaml2idp_persistentid_sp_id_83e91899_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.djangosaml2idp_persistentid
    ADD CONSTRAINT djangosaml2idp_persistentid_sp_id_83e91899_fk FOREIGN KEY (sp_id) REFERENCES public.djangosaml2idp_serviceprovider(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: files_directory files_directory_client_id_930fbefa_fk_clients_clientinfo_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files_directory
    ADD CONSTRAINT files_directory_client_id_930fbefa_fk_clients_clientinfo_id FOREIGN KEY (client_id) REFERENCES public.clients_clientinfo(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: files_directory files_directory_created_by_id_b9255055_fk_authentic; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files_directory
    ADD CONSTRAINT files_directory_created_by_id_b9255055_fk_authentic FOREIGN KEY (created_by_id) REFERENCES public.authentication_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: files_directory files_directory_parent_directory_id_e3160d61_fk_files_dir; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files_directory
    ADD CONSTRAINT files_directory_parent_directory_id_e3160d61_fk_files_dir FOREIGN KEY (parent_directory_id) REFERENCES public.files_directory(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: files_directory files_directory_updated_by_id_7a9a4536_fk_authentic; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files_directory
    ADD CONSTRAINT files_directory_updated_by_id_7a9a4536_fk_authentic FOREIGN KEY (updated_by_id) REFERENCES public.authentication_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: files_file files_file_client_id_d53390d8_fk_clients_clientinfo_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files_file
    ADD CONSTRAINT files_file_client_id_d53390d8_fk_clients_clientinfo_id FOREIGN KEY (client_id) REFERENCES public.clients_clientinfo(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: files_file files_file_created_by_id_18705c0e_fk_authentication_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files_file
    ADD CONSTRAINT files_file_created_by_id_18705c0e_fk_authentication_user_id FOREIGN KEY (created_by_id) REFERENCES public.authentication_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: files_file files_file_parent_directory_id_8b813123_fk_files_directory_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files_file
    ADD CONSTRAINT files_file_parent_directory_id_8b813123_fk_files_directory_id FOREIGN KEY (parent_directory_id) REFERENCES public.files_directory(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: files_file files_file_updated_by_id_2cb8c87c_fk_authentication_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files_file
    ADD CONSTRAINT files_file_updated_by_id_2cb8c87c_fk_authentication_user_id FOREIGN KEY (updated_by_id) REFERENCES public.authentication_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: mdl_client_custom_field_values mdl_client_custom_fi_custom_field_id_e2155c5a_fk_mdl_clien; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_client_custom_field_values
    ADD CONSTRAINT mdl_client_custom_fi_custom_field_id_e2155c5a_fk_mdl_clien FOREIGN KEY (custom_field_id) REFERENCES public.mdl_client_custom_fields(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: mdl_client_modules_config mdl_client_modules_c_client_module_id_eacec894_fk_mdl_clien; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_client_modules_config
    ADD CONSTRAINT mdl_client_modules_c_client_module_id_eacec894_fk_mdl_clien FOREIGN KEY (client_module_id) REFERENCES public.mdl_client_modules(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: mdl_client_modules mdl_client_modules_parent_id_00da0636_fk_mdl_client_modules_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_client_modules
    ADD CONSTRAINT mdl_client_modules_parent_id_00da0636_fk_mdl_client_modules_id FOREIGN KEY (parent_id) REFERENCES public.mdl_client_modules(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: mdl_survey_option_bank_translations mdl_survey_option_ba_language_id_11f878c8_fk_translati; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_survey_option_bank_translations
    ADD CONSTRAINT mdl_survey_option_ba_language_id_11f878c8_fk_translati FOREIGN KEY (language_id) REFERENCES public.translations_mdlsupportedlanguages(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: mdl_survey_option_bank_option_translations mdl_survey_option_ba_language_id_8ebbe87c_fk_translati; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_survey_option_bank_option_translations
    ADD CONSTRAINT mdl_survey_option_ba_language_id_8ebbe87c_fk_translati FOREIGN KEY (language_id) REFERENCES public.translations_mdlsupportedlanguages(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: mdl_survey_option_bank_options mdl_survey_option_ba_mdlsurveyoptionbank__09fa5ba8_fk_mdl_surve; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_survey_option_bank_options
    ADD CONSTRAINT mdl_survey_option_ba_mdlsurveyoptionbank__09fa5ba8_fk_mdl_surve FOREIGN KEY (mdlsurveyoptionbank_id) REFERENCES public.mdl_survey_option_bank(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: mdl_survey_option_bank_title_translations mdl_survey_option_ba_mdlsurveyoptionbank__844d34ca_fk_mdl_surve; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_survey_option_bank_title_translations
    ADD CONSTRAINT mdl_survey_option_ba_mdlsurveyoptionbank__844d34ca_fk_mdl_surve FOREIGN KEY (mdlsurveyoptionbank_id) REFERENCES public.mdl_survey_option_bank(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: mdl_survey_option_bank_optionss_option_translations mdl_survey_option_ba_mdlsurveyoptionbanko_3aca9bfa_fk_mdl_surve; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_survey_option_bank_optionss_option_translations
    ADD CONSTRAINT mdl_survey_option_ba_mdlsurveyoptionbanko_3aca9bfa_fk_mdl_surve FOREIGN KEY (mdlsurveyoptionbankoptiontranslations_id) REFERENCES public.mdl_survey_option_bank_option_translations(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: mdl_survey_option_bank_options mdl_survey_option_ba_mdlsurveyoptionbanko_756966d4_fk_mdl_surve; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_survey_option_bank_options
    ADD CONSTRAINT mdl_survey_option_ba_mdlsurveyoptionbanko_756966d4_fk_mdl_surve FOREIGN KEY (mdlsurveyoptionbankoptions_id) REFERENCES public.mdl_survey_option_bank_optionss(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: mdl_survey_option_bank_optionss_option_translations mdl_survey_option_ba_mdlsurveyoptionbanko_a6aff2a8_fk_mdl_surve; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_survey_option_bank_optionss_option_translations
    ADD CONSTRAINT mdl_survey_option_ba_mdlsurveyoptionbanko_a6aff2a8_fk_mdl_surve FOREIGN KEY (mdlsurveyoptionbankoptions_id) REFERENCES public.mdl_survey_option_bank_optionss(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: mdl_survey_option_bank_title_translations mdl_survey_option_ba_mdlsurveyoptionbankt_069cc4e5_fk_mdl_surve; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_survey_option_bank_title_translations
    ADD CONSTRAINT mdl_survey_option_ba_mdlsurveyoptionbankt_069cc4e5_fk_mdl_surve FOREIGN KEY (mdlsurveyoptionbanktranslations_id) REFERENCES public.mdl_survey_option_bank_translations(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: mdl_wc_contact_attachments mdl_wc_contact_attac_binary_content_id_40c323ea_fk_mdl_wc_co; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_wc_contact_attachments
    ADD CONSTRAINT mdl_wc_contact_attac_binary_content_id_40c323ea_fk_mdl_wc_co FOREIGN KEY (binary_content_id) REFERENCES public.mdl_wc_contact_attachment_content(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: mdl_wc_contact_group_translations mdl_wc_contact_group_language_id_3b95f317_fk_translati; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_wc_contact_group_translations
    ADD CONSTRAINT mdl_wc_contact_group_language_id_3b95f317_fk_translati FOREIGN KEY (language_id) REFERENCES public.translations_mdlsupportedlanguages(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: mdl_wc_contact_groups_translations mdl_wc_contact_group_mdlwccontactgroup_id_4d58ffff_fk_mdl_wc_co; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_wc_contact_groups_translations
    ADD CONSTRAINT mdl_wc_contact_group_mdlwccontactgroup_id_4d58ffff_fk_mdl_wc_co FOREIGN KEY (mdlwccontactgroup_id) REFERENCES public.mdl_wc_contact_groups(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: mdl_wc_contact_groups_translations mdl_wc_contact_group_mdlwccontactgrouptra_deff7c9a_fk_mdl_wc_co; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_wc_contact_groups_translations
    ADD CONSTRAINT mdl_wc_contact_group_mdlwccontactgrouptra_deff7c9a_fk_mdl_wc_co FOREIGN KEY (mdlwccontactgrouptranslations_id) REFERENCES public.mdl_wc_contact_group_translations(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: notifications_smscredits notifications_smscre_client_id_8448e01a_fk_clients_c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications_smscredits
    ADD CONSTRAINT notifications_smscre_client_id_8448e01a_fk_clients_c FOREIGN KEY (client_id) REFERENCES public.clients_clientinfo(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: participants_participant_groups participants_partici_participant_id_f4f53abe_fk_participa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participants_participant_groups
    ADD CONSTRAINT participants_partici_participant_id_f4f53abe_fk_participa FOREIGN KEY (participant_id) REFERENCES public.participants_participant(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: participants_participant_groups participants_partici_participantgroups_id_1441c43b_fk_participa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.participants_participant_groups
    ADD CONSTRAINT participants_partici_participantgroups_id_1441c43b_fk_participa FOREIGN KEY (participantgroups_id) REFERENCES public.participants_participantgroups(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: payslip_employee payslip_employee_payslip_id_39078d9f_fk_payslip_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payslip_employee
    ADD CONSTRAINT payslip_employee_payslip_id_39078d9f_fk_payslip_id FOREIGN KEY (payslip_id) REFERENCES public.payslip(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: payslip_generated payslip_generated_payslip_employee_id_780e2936_fk_payslip_e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payslip_generated
    ADD CONSTRAINT payslip_generated_payslip_employee_id_780e2936_fk_payslip_e FOREIGN KEY (payslip_employee_id) REFERENCES public.payslip_employee(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: payslip_generated payslip_generated_payslip_id_ac9baa41_fk_payslip_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payslip_generated
    ADD CONSTRAINT payslip_generated_payslip_id_ac9baa41_fk_payslip_id FOREIGN KEY (payslip_id) REFERENCES public.payslip(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: payslip payslip_task_id_f46d69fb_fk_django_celery_task_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payslip
    ADD CONSTRAINT payslip_task_id_f46d69fb_fk_django_celery_task_id FOREIGN KEY (task_id) REFERENCES public.django_celery_task(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: payslip payslip_uploaded_file_id_4a2b5efe_fk_payslip_uploaded_file_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payslip
    ADD CONSTRAINT payslip_uploaded_file_id_4a2b5efe_fk_payslip_uploaded_file_id FOREIGN KEY (uploaded_file_id) REFERENCES public.payslip_uploaded_file(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: shared_files_directory shared_files_directo_client_id_be3b0b16_fk_clients_c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shared_files_directory
    ADD CONSTRAINT shared_files_directo_client_id_be3b0b16_fk_clients_c FOREIGN KEY (client_id) REFERENCES public.clients_clientinfo(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: shared_files_directory shared_files_directo_created_by_id_19b47f40_fk_authentic; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shared_files_directory
    ADD CONSTRAINT shared_files_directo_created_by_id_19b47f40_fk_authentic FOREIGN KEY (created_by_id) REFERENCES public.authentication_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: shared_files_directory shared_files_directo_parent_directory_id_28ee435f_fk_shared_fi; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shared_files_directory
    ADD CONSTRAINT shared_files_directo_parent_directory_id_28ee435f_fk_shared_fi FOREIGN KEY (parent_directory_id) REFERENCES public.shared_files_directory(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: shared_files_directory shared_files_directo_updated_by_id_1015efb3_fk_authentic; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shared_files_directory
    ADD CONSTRAINT shared_files_directo_updated_by_id_1015efb3_fk_authentic FOREIGN KEY (updated_by_id) REFERENCES public.authentication_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: shared_files_file shared_files_file_client_id_5462d6db_fk_clients_clientinfo_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shared_files_file
    ADD CONSTRAINT shared_files_file_client_id_5462d6db_fk_clients_clientinfo_id FOREIGN KEY (client_id) REFERENCES public.clients_clientinfo(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: shared_files_file shared_files_file_created_by_id_9a37b81c_fk_authentic; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shared_files_file
    ADD CONSTRAINT shared_files_file_created_by_id_9a37b81c_fk_authentic FOREIGN KEY (created_by_id) REFERENCES public.authentication_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: shared_files_file shared_files_file_parent_directory_id_4abe28fe_fk_shared_fi; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shared_files_file
    ADD CONSTRAINT shared_files_file_parent_directory_id_4abe28fe_fk_shared_fi FOREIGN KEY (parent_directory_id) REFERENCES public.shared_files_directory(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: shared_files_file shared_files_file_updated_by_id_473b0a5b_fk_authentic; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shared_files_file
    ADD CONSTRAINT shared_files_file_updated_by_id_473b0a5b_fk_authentic FOREIGN KEY (updated_by_id) REFERENCES public.authentication_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: silk_profile_queries silk_profile_queries_profile_id_a3d76db8_fk_silk_profile_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.silk_profile_queries
    ADD CONSTRAINT silk_profile_queries_profile_id_a3d76db8_fk_silk_profile_id FOREIGN KEY (profile_id) REFERENCES public.silk_profile(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: silk_profile_queries silk_profile_queries_sqlquery_id_155df455_fk_silk_sqlquery_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.silk_profile_queries
    ADD CONSTRAINT silk_profile_queries_sqlquery_id_155df455_fk_silk_sqlquery_id FOREIGN KEY (sqlquery_id) REFERENCES public.silk_sqlquery(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: silk_profile silk_profile_request_id_7b81bd69_fk_silk_request_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.silk_profile
    ADD CONSTRAINT silk_profile_request_id_7b81bd69_fk_silk_request_id FOREIGN KEY (request_id) REFERENCES public.silk_request(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: silk_response silk_response_request_id_1e8e2776_fk_silk_request_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.silk_response
    ADD CONSTRAINT silk_response_request_id_1e8e2776_fk_silk_request_id FOREIGN KEY (request_id) REFERENCES public.silk_request(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: silk_sqlquery silk_sqlquery_request_id_6f8f0527_fk_silk_request_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.silk_sqlquery
    ADD CONSTRAINT silk_sqlquery_request_id_6f8f0527_fk_silk_request_id FOREIGN KEY (request_id) REFERENCES public.silk_request(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurvey_active_languages survey_mdlsurvey_act_supportedlanguages_i_9b8d6bf7_fk_translati; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurvey_active_languages
    ADD CONSTRAINT survey_mdlsurvey_act_supportedlanguages_i_9b8d6bf7_fk_translati FOREIGN KEY (supportedlanguages_id) REFERENCES public.translations_mdlsupportedlanguages(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurvey_active_languages survey_mdlsurvey_act_survey_id_f2111ba8_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurvey_active_languages
    ADD CONSTRAINT survey_mdlsurvey_act_survey_id_f2111ba8_fk_survey_md FOREIGN KEY (survey_id) REFERENCES public.survey_mdlsurvey(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurvey survey_mdlsurvey_closing_message_id_3ffeb305_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurvey
    ADD CONSTRAINT survey_mdlsurvey_closing_message_id_3ffeb305_fk_survey_md FOREIGN KEY (closing_message_id) REFERENCES public.survey_mdlsurveyclosingmessage(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurvey survey_mdlsurvey_opening_message_id_6d63629e_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurvey
    ADD CONSTRAINT survey_mdlsurvey_opening_message_id_6d63629e_fk_survey_md FOREIGN KEY (opening_message_id) REFERENCES public.survey_mdlsurveyopeningmessage(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurvey_posters survey_mdlsurvey_pos_mdlsurvey_id_b149abfa_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurvey_posters
    ADD CONSTRAINT survey_mdlsurvey_pos_mdlsurvey_id_b149abfa_fk_survey_md FOREIGN KEY (mdlsurvey_id) REFERENCES public.survey_mdlsurvey(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurvey_posters survey_mdlsurvey_pos_mdlsurveyposters_id_bf242b0c_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurvey_posters
    ADD CONSTRAINT survey_mdlsurvey_pos_mdlsurveyposters_id_bf242b0c_fk_survey_md FOREIGN KEY (mdlsurveyposters_id) REFERENCES public.survey_mdlsurveyposters(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurvey_questions survey_mdlsurvey_que_mdlsurvey_id_5b27b908_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurvey_questions
    ADD CONSTRAINT survey_mdlsurvey_que_mdlsurvey_id_5b27b908_fk_survey_md FOREIGN KEY (mdlsurvey_id) REFERENCES public.survey_mdlsurvey(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurvey_questions survey_mdlsurvey_que_mdlsurveyquestions_i_833b90d6_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurvey_questions
    ADD CONSTRAINT survey_mdlsurvey_que_mdlsurveyquestions_i_833b90d6_fk_survey_md FOREIGN KEY (mdlsurveyquestions_id) REFERENCES public.survey_mdlsurveyquestions(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurvey_reporting_categories survey_mdlsurvey_rep_mdlsurvey_id_abee8ba6_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurvey_reporting_categories
    ADD CONSTRAINT survey_mdlsurvey_rep_mdlsurvey_id_abee8ba6_fk_survey_md FOREIGN KEY (mdlsurvey_id) REFERENCES public.survey_mdlsurvey(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurvey_reporting_categories survey_mdlsurvey_rep_mdlsurveyreportingca_c4660726_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurvey_reporting_categories
    ADD CONSTRAINT survey_mdlsurvey_rep_mdlsurveyreportingca_c4660726_fk_survey_md FOREIGN KEY (mdlsurveyreportingcategory_id) REFERENCES public.survey_mdlsurveyreportingcategory(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurvey_shared_clients survey_mdlsurvey_sha_clientinfo_id_24771560_fk_clients_c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurvey_shared_clients
    ADD CONSTRAINT survey_mdlsurvey_sha_clientinfo_id_24771560_fk_clients_c FOREIGN KEY (clientinfo_id) REFERENCES public.clients_clientinfo(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurvey_shared_clients survey_mdlsurvey_sha_mdlsurvey_id_9b780032_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurvey_shared_clients
    ADD CONSTRAINT survey_mdlsurvey_sha_mdlsurvey_id_9b780032_fk_survey_md FOREIGN KEY (mdlsurvey_id) REFERENCES public.survey_mdlsurvey(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurvey_supported_languages survey_mdlsurvey_sup_mdlsupportedlanguage_9f74b6c0_fk_translati; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurvey_supported_languages
    ADD CONSTRAINT survey_mdlsurvey_sup_mdlsupportedlanguage_9f74b6c0_fk_translati FOREIGN KEY (mdlsupportedlanguages_id) REFERENCES public.translations_mdlsupportedlanguages(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurvey_supported_languages survey_mdlsurvey_sup_mdlsurvey_id_fcaefdfa_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurvey_supported_languages
    ADD CONSTRAINT survey_mdlsurvey_sup_mdlsurvey_id_fcaefdfa_fk_survey_md FOREIGN KEY (mdlsurvey_id) REFERENCES public.survey_mdlsurvey(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurvey_template_supported_languages survey_mdlsurvey_tem_mdlsurvey_id_85dc6c06_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurvey_template_supported_languages
    ADD CONSTRAINT survey_mdlsurvey_tem_mdlsurvey_id_85dc6c06_fk_survey_md FOREIGN KEY (mdlsurvey_id) REFERENCES public.survey_mdlsurvey(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurvey_template_supported_languages survey_mdlsurvey_tem_mdltemplate_supporte_80da2ce9_fk_translati; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurvey_template_supported_languages
    ADD CONSTRAINT survey_mdlsurvey_tem_mdltemplate_supporte_80da2ce9_fk_translati FOREIGN KEY (mdltemplate_supported_languages_id) REFERENCES public.translations_mdlsupportedlanguages(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurvey_translations survey_mdlsurvey_tra_mdlsurvey_id_f545bb87_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurvey_translations
    ADD CONSTRAINT survey_mdlsurvey_tra_mdlsurvey_id_f545bb87_fk_survey_md FOREIGN KEY (mdlsurvey_id) REFERENCES public.survey_mdlsurvey(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurvey_translations survey_mdlsurvey_tra_mdlsurveytitletransl_d2ac92e1_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurvey_translations
    ADD CONSTRAINT survey_mdlsurvey_tra_mdlsurveytitletransl_d2ac92e1_fk_survey_md FOREIGN KEY (mdlsurveytitletranslations_id) REFERENCES public.survey_mdlsurveytitletranslations(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyclientquestiontemplateconfig_client_id survey_mdlsurveyclie_clientinfo_id_81d3f6c8_fk_clients_c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyclientquestiontemplateconfig_client_id
    ADD CONSTRAINT survey_mdlsurveyclie_clientinfo_id_81d3f6c8_fk_clients_c FOREIGN KEY (clientinfo_id) REFERENCES public.clients_clientinfo(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyclientquestiontemplateconfig_client_id survey_mdlsurveyclie_mdlsurveyclientquest_edf8cc4e_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyclientquestiontemplateconfig_client_id
    ADD CONSTRAINT survey_mdlsurveyclie_mdlsurveyclientquest_edf8cc4e_fk_survey_md FOREIGN KEY (mdlsurveyclientquestiontemplateconfig_id) REFERENCES public.survey_mdlsurveyclientquestiontemplateconfig(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyclientquestiontemplateconfig survey_mdlsurveyclie_question_id_9d1fdf39_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyclientquestiontemplateconfig
    ADD CONSTRAINT survey_mdlsurveyclie_question_id_9d1fdf39_fk_survey_md FOREIGN KEY (question_id) REFERENCES public.survey_mdlsurveyquestiontemplate(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyclosingmessagetranslations survey_mdlsurveyclos_language_id_17423a4e_fk_translati; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyclosingmessagetranslations
    ADD CONSTRAINT survey_mdlsurveyclos_language_id_17423a4e_fk_translati FOREIGN KEY (language_id) REFERENCES public.translations_mdlsupportedlanguages(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyclosingmessage_translation survey_mdlsurveyclos_mdlsurveyclosingmess_53a50a46_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyclosingmessage_translation
    ADD CONSTRAINT survey_mdlsurveyclos_mdlsurveyclosingmess_53a50a46_fk_survey_md FOREIGN KEY (mdlsurveyclosingmessagetranslations_id) REFERENCES public.survey_mdlsurveyclosingmessagetranslations(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyclosingmessage_translation survey_mdlsurveyclos_mdlsurveyclosingmess_87c7804e_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyclosingmessage_translation
    ADD CONSTRAINT survey_mdlsurveyclos_mdlsurveyclosingmess_87c7804e_fk_survey_md FOREIGN KEY (mdlsurveyclosingmessage_id) REFERENCES public.survey_mdlsurveyclosingmessage(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyopeningmessagetranslations survey_mdlsurveyopen_language_id_37da50ad_fk_translati; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyopeningmessagetranslations
    ADD CONSTRAINT survey_mdlsurveyopen_language_id_37da50ad_fk_translati FOREIGN KEY (language_id) REFERENCES public.translations_mdlsupportedlanguages(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyopeningmessage_translation survey_mdlsurveyopen_mdlsurveyopeningmess_841a2dda_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyopeningmessage_translation
    ADD CONSTRAINT survey_mdlsurveyopen_mdlsurveyopeningmess_841a2dda_fk_survey_md FOREIGN KEY (mdlsurveyopeningmessagetranslations_id) REFERENCES public.survey_mdlsurveyopeningmessagetranslations(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyopeningmessage_translation survey_mdlsurveyopen_mdlsurveyopeningmess_a54147e2_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyopeningmessage_translation
    ADD CONSTRAINT survey_mdlsurveyopen_mdlsurveyopeningmess_a54147e2_fk_survey_md FOREIGN KEY (mdlsurveyopeningmessage_id) REFERENCES public.survey_mdlsurveyopeningmessage(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyquestiontemplate survey_mdlsurveyques_category_id_4005b722_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestiontemplate
    ADD CONSTRAINT survey_mdlsurveyques_category_id_4005b722_fk_survey_md FOREIGN KEY (category_id) REFERENCES public.survey_mdlsurveyquestioncategory(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyquestiontemplate_client_id survey_mdlsurveyques_clientinfo_id_11e58766_fk_clients_c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestiontemplate_client_id
    ADD CONSTRAINT survey_mdlsurveyques_clientinfo_id_11e58766_fk_clients_c FOREIGN KEY (clientinfo_id) REFERENCES public.clients_clientinfo(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyquestiontemplatetranslations_client_id survey_mdlsurveyques_clientinfo_id_1d05a07d_fk_clients_c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestiontemplatetranslations_client_id
    ADD CONSTRAINT survey_mdlsurveyques_clientinfo_id_1d05a07d_fk_clients_c FOREIGN KEY (clientinfo_id) REFERENCES public.clients_clientinfo(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyquestiontemplatetypeconfig_client_id survey_mdlsurveyques_clientinfo_id_8dc07c37_fk_clients_c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestiontemplatetypeconfig_client_id
    ADD CONSTRAINT survey_mdlsurveyques_clientinfo_id_8dc07c37_fk_clients_c FOREIGN KEY (clientinfo_id) REFERENCES public.clients_clientinfo(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyquestiontemplatemedia_client_id survey_mdlsurveyques_clientinfo_id_9c90f976_fk_clients_c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestiontemplatemedia_client_id
    ADD CONSTRAINT survey_mdlsurveyques_clientinfo_id_9c90f976_fk_clients_c FOREIGN KEY (clientinfo_id) REFERENCES public.clients_clientinfo(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyquestionoptionsmedia_client_id survey_mdlsurveyques_clientinfo_id_b2b28ad2_fk_clients_c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestionoptionsmedia_client_id
    ADD CONSTRAINT survey_mdlsurveyques_clientinfo_id_b2b28ad2_fk_clients_c FOREIGN KEY (clientinfo_id) REFERENCES public.clients_clientinfo(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyquestioncategory_client_id survey_mdlsurveyques_clientinfo_id_d9b32371_fk_clients_c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestioncategory_client_id
    ADD CONSTRAINT survey_mdlsurveyques_clientinfo_id_d9b32371_fk_clients_c FOREIGN KEY (clientinfo_id) REFERENCES public.clients_clientinfo(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyquestionoptiontranslations survey_mdlsurveyques_language_id_7fd982af_fk_translati; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestionoptiontranslations
    ADD CONSTRAINT survey_mdlsurveyques_language_id_7fd982af_fk_translati FOREIGN KEY (language_id) REFERENCES public.translations_mdlsupportedlanguages(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyquestiontranslations survey_mdlsurveyques_language_id_bc9ae72c_fk_translati; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestiontranslations
    ADD CONSTRAINT survey_mdlsurveyques_language_id_bc9ae72c_fk_translati FOREIGN KEY (language_id) REFERENCES public.translations_mdlsupportedlanguages(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyquestionresponses survey_mdlsurveyques_language_id_ea3d6252_fk_translati; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestionresponses
    ADD CONSTRAINT survey_mdlsurveyques_language_id_ea3d6252_fk_translati FOREIGN KEY (language_id) REFERENCES public.translations_mdlsupportedlanguages(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyquestioncategory_client_id survey_mdlsurveyques_mdlsurveyquestioncat_ab49b5f5_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestioncategory_client_id
    ADD CONSTRAINT survey_mdlsurveyques_mdlsurveyquestioncat_ab49b5f5_fk_survey_md FOREIGN KEY (mdlsurveyquestioncategory_id) REFERENCES public.survey_mdlsurveyquestioncategory(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyquestionoptions_option_translations survey_mdlsurveyques_mdlsurveyquestionopt_299dc37a_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestionoptions_option_translations
    ADD CONSTRAINT survey_mdlsurveyques_mdlsurveyquestionopt_299dc37a_fk_survey_md FOREIGN KEY (mdlsurveyquestionoptions_id) REFERENCES public.survey_mdlsurveyquestionoptions(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyquestionoptionsmedia_client_id survey_mdlsurveyques_mdlsurveyquestionopt_8eeb36b6_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestionoptionsmedia_client_id
    ADD CONSTRAINT survey_mdlsurveyques_mdlsurveyquestionopt_8eeb36b6_fk_survey_md FOREIGN KEY (mdlsurveyquestionoptionsmedia_id) REFERENCES public.survey_mdlsurveyquestionoptionsmedia(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyquestions_question_options survey_mdlsurveyques_mdlsurveyquestionopt_ad3cf73a_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestions_question_options
    ADD CONSTRAINT survey_mdlsurveyques_mdlsurveyquestionopt_ad3cf73a_fk_survey_md FOREIGN KEY (mdlsurveyquestionoptions_id) REFERENCES public.survey_mdlsurveyquestionoptions(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyquestionoptions_option_translations survey_mdlsurveyques_mdlsurveyquestionopt_f6ae72a2_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestionoptions_option_translations
    ADD CONSTRAINT survey_mdlsurveyques_mdlsurveyquestionopt_f6ae72a2_fk_survey_md FOREIGN KEY (mdlsurveyquestionoptiontranslations_id) REFERENCES public.survey_mdlsurveyquestionoptiontranslations(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyquestions_question_options survey_mdlsurveyques_mdlsurveyquestions_i_a1e25359_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestions_question_options
    ADD CONSTRAINT survey_mdlsurveyques_mdlsurveyquestions_i_a1e25359_fk_survey_md FOREIGN KEY (mdlsurveyquestions_id) REFERENCES public.survey_mdlsurveyquestions(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyquestions_reporting_categories survey_mdlsurveyques_mdlsurveyquestions_i_b1b38f42_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestions_reporting_categories
    ADD CONSTRAINT survey_mdlsurveyques_mdlsurveyquestions_i_b1b38f42_fk_survey_md FOREIGN KEY (mdlsurveyquestions_id) REFERENCES public.survey_mdlsurveyquestions(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyquestions_translations survey_mdlsurveyques_mdlsurveyquestions_i_dc612f13_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestions_translations
    ADD CONSTRAINT survey_mdlsurveyques_mdlsurveyquestions_i_dc612f13_fk_survey_md FOREIGN KEY (mdlsurveyquestions_id) REFERENCES public.survey_mdlsurveyquestions(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyquestiontemplatetranslations_client_id survey_mdlsurveyques_mdlsurveyquestiontem_19b20dd0_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestiontemplatetranslations_client_id
    ADD CONSTRAINT survey_mdlsurveyques_mdlsurveyquestiontem_19b20dd0_fk_survey_md FOREIGN KEY (mdlsurveyquestiontemplatetranslations_id) REFERENCES public.survey_mdlsurveyquestiontemplatetranslations(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyquestiontemplate_client_id survey_mdlsurveyques_mdlsurveyquestiontem_3cb439ea_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestiontemplate_client_id
    ADD CONSTRAINT survey_mdlsurveyques_mdlsurveyquestiontem_3cb439ea_fk_survey_md FOREIGN KEY (mdlsurveyquestiontemplate_id) REFERENCES public.survey_mdlsurveyquestiontemplate(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyquestiontemplatetypeconfig_client_id survey_mdlsurveyques_mdlsurveyquestiontem_faa9ddd4_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestiontemplatetypeconfig_client_id
    ADD CONSTRAINT survey_mdlsurveyques_mdlsurveyquestiontem_faa9ddd4_fk_survey_md FOREIGN KEY (mdlsurveyquestiontemplatetypeconfig_id) REFERENCES public.survey_mdlsurveyquestiontemplatetypeconfig(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyquestiontemplatemedia_client_id survey_mdlsurveyques_mdlsurveyquestiontem_fc371104_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestiontemplatemedia_client_id
    ADD CONSTRAINT survey_mdlsurveyques_mdlsurveyquestiontem_fc371104_fk_survey_md FOREIGN KEY (mdlsurveyquestiontemplatemedia_id) REFERENCES public.survey_mdlsurveyquestiontemplatemedia(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyquestions_translations survey_mdlsurveyques_mdlsurveyquestiontra_3c06a9b2_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestions_translations
    ADD CONSTRAINT survey_mdlsurveyques_mdlsurveyquestiontra_3c06a9b2_fk_survey_md FOREIGN KEY (mdlsurveyquestiontranslations_id) REFERENCES public.survey_mdlsurveyquestiontranslations(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyquestions_reporting_categories survey_mdlsurveyques_mdlsurveyreportingca_947c6407_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestions_reporting_categories
    ADD CONSTRAINT survey_mdlsurveyques_mdlsurveyreportingca_947c6407_fk_survey_md FOREIGN KEY (mdlsurveyreportingcategory_id) REFERENCES public.survey_mdlsurveyreportingcategory(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyquestiontemplate survey_mdlsurveyques_q_type_id_8fc886ae_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestiontemplate
    ADD CONSTRAINT survey_mdlsurveyques_q_type_id_8fc886ae_fk_survey_md FOREIGN KEY (q_type_id) REFERENCES public.survey_mdlsurveyquestiontype(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyquestions survey_mdlsurveyques_q_type_id_c7555507_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestions
    ADD CONSTRAINT survey_mdlsurveyques_q_type_id_c7555507_fk_survey_md FOREIGN KEY (q_type_id) REFERENCES public.survey_mdlsurveyquestiontype(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyquestiontemplatetypeconfig survey_mdlsurveyques_question_id_7a54502d_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestiontemplatetypeconfig
    ADD CONSTRAINT survey_mdlsurveyques_question_id_7a54502d_fk_survey_md FOREIGN KEY (question_id) REFERENCES public.survey_mdlsurveyquestiontemplate(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyquestiontemplatetranslations survey_mdlsurveyques_question_id_b47bf7fa_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestiontemplatetranslations
    ADD CONSTRAINT survey_mdlsurveyques_question_id_b47bf7fa_fk_survey_md FOREIGN KEY (question_id) REFERENCES public.survey_mdlsurveyquestiontemplate(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyquestiontemplatemedia survey_mdlsurveyques_question_id_c0d153f2_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestiontemplatemedia
    ADD CONSTRAINT survey_mdlsurveyques_question_id_c0d153f2_fk_survey_md FOREIGN KEY (question_id) REFERENCES public.survey_mdlsurveyquestiontemplate(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyquestionoptionsmedia survey_mdlsurveyques_question_id_d4be051e_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestionoptionsmedia
    ADD CONSTRAINT survey_mdlsurveyques_question_id_d4be051e_fk_survey_md FOREIGN KEY (question_id) REFERENCES public.survey_mdlsurveyquestiontemplatetypeconfig(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyquestionresponses survey_mdlsurveyques_question_option_id_01d9f60c_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestionresponses
    ADD CONSTRAINT survey_mdlsurveyques_question_option_id_01d9f60c_fk_survey_md FOREIGN KEY (question_option_id) REFERENCES public.survey_mdlsurveyquestionoptions(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyquestionresponses survey_mdlsurveyques_survey_id_1bbb53f7_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestionresponses
    ADD CONSTRAINT survey_mdlsurveyques_survey_id_1bbb53f7_fk_survey_md FOREIGN KEY (survey_id) REFERENCES public.survey_mdlsurvey(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyquestionresponses survey_mdlsurveyques_survey_question_id_3dd0ba5f_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestionresponses
    ADD CONSTRAINT survey_mdlsurveyques_survey_question_id_3dd0ba5f_fk_survey_md FOREIGN KEY (survey_question_id) REFERENCES public.survey_mdlsurveyquestions(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyquestionresponses survey_mdlsurveyques_survey_user_response_6542c110_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestionresponses
    ADD CONSTRAINT survey_mdlsurveyques_survey_user_response_6542c110_fk_survey_md FOREIGN KEY (survey_user_response_id) REFERENCES public.survey_mdlsurveyuserresponses(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyquestiontypeoptions survey_mdlsurveyques_type_id_05cab515_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyquestiontypeoptions
    ADD CONSTRAINT survey_mdlsurveyques_type_id_05cab515_fk_survey_md FOREIGN KEY (type_id) REFERENCES public.survey_mdlsurveyquestiontype(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyreportingcategorytranslations survey_mdlsurveyrepo_language_id_9d189398_fk_translati; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyreportingcategorytranslations
    ADD CONSTRAINT survey_mdlsurveyrepo_language_id_9d189398_fk_translati FOREIGN KEY (language_id) REFERENCES public.translations_mdlsupportedlanguages(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyreportingcategory_supported_languages survey_mdlsurveyrepo_mdlsupportedlanguage_c0607f69_fk_translati; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyreportingcategory_supported_languages
    ADD CONSTRAINT survey_mdlsurveyrepo_mdlsupportedlanguage_c0607f69_fk_translati FOREIGN KEY (mdlsupportedlanguages_id) REFERENCES public.translations_mdlsupportedlanguages(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyreportingcategory_translations survey_mdlsurveyrepo_mdlsurveyreportingca_542c6b04_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyreportingcategory_translations
    ADD CONSTRAINT survey_mdlsurveyrepo_mdlsurveyreportingca_542c6b04_fk_survey_md FOREIGN KEY (mdlsurveyreportingcategorytranslations_id) REFERENCES public.survey_mdlsurveyreportingcategorytranslations(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyreportingcategory_translations survey_mdlsurveyrepo_mdlsurveyreportingca_81656a76_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyreportingcategory_translations
    ADD CONSTRAINT survey_mdlsurveyrepo_mdlsurveyreportingca_81656a76_fk_survey_md FOREIGN KEY (mdlsurveyreportingcategory_id) REFERENCES public.survey_mdlsurveyreportingcategory(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyreportingcategory_supported_languages survey_mdlsurveyrepo_mdlsurveyreportingca_90a8174a_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyreportingcategory_supported_languages
    ADD CONSTRAINT survey_mdlsurveyrepo_mdlsurveyreportingca_90a8174a_fk_survey_md FOREIGN KEY (mdlsurveyreportingcategory_id) REFERENCES public.survey_mdlsurveyreportingcategory(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveytemplate_shared_clients survey_mdlsurveytemp_clientinfo_id_2ef57e92_fk_clients_c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplate_shared_clients
    ADD CONSTRAINT survey_mdlsurveytemp_clientinfo_id_2ef57e92_fk_clients_c FOREIGN KEY (clientinfo_id) REFERENCES public.clients_clientinfo(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveytemplatequestiontranslations survey_mdlsurveytemp_language_id_9798ffc2_fk_translati; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplatequestiontranslations
    ADD CONSTRAINT survey_mdlsurveytemp_language_id_9798ffc2_fk_translati FOREIGN KEY (language_id) REFERENCES public.translations_mdlsupportedlanguages(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveytemplatequestionoptionstranslations survey_mdlsurveytemp_language_id_d84142e3_fk_translati; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplatequestionoptionstranslations
    ADD CONSTRAINT survey_mdlsurveytemp_language_id_d84142e3_fk_translati FOREIGN KEY (language_id) REFERENCES public.translations_mdlsupportedlanguages(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveytemplatetranslations survey_mdlsurveytemp_language_id_e5b0e059_fk_translati; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplatetranslations
    ADD CONSTRAINT survey_mdlsurveytemp_language_id_e5b0e059_fk_translati FOREIGN KEY (language_id) REFERENCES public.translations_mdlsupportedlanguages(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveytemplate_supported_languages survey_mdlsurveytemp_mdlsupportedlanguage_6aac5a58_fk_translati; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplate_supported_languages
    ADD CONSTRAINT survey_mdlsurveytemp_mdlsupportedlanguage_6aac5a58_fk_translati FOREIGN KEY (mdlsupportedlanguages_id) REFERENCES public.translations_mdlsupportedlanguages(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveytemplatequestion_reporting_categories survey_mdlsurveytemp_mdlsurveyreportingca_a9b0e193_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplatequestion_reporting_categories
    ADD CONSTRAINT survey_mdlsurveytemp_mdlsurveyreportingca_a9b0e193_fk_survey_md FOREIGN KEY (mdlsurveyreportingcategory_id) REFERENCES public.survey_mdlsurveyreportingcategory(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveytemplate_reporting_categories survey_mdlsurveytemp_mdlsurveyreportingca_e6b22b82_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplate_reporting_categories
    ADD CONSTRAINT survey_mdlsurveytemp_mdlsurveyreportingca_e6b22b82_fk_survey_md FOREIGN KEY (mdlsurveyreportingcategory_id) REFERENCES public.survey_mdlsurveyreportingcategory(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveytemplate_reporting_categories survey_mdlsurveytemp_mdlsurveytemplate_id_34bee454_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplate_reporting_categories
    ADD CONSTRAINT survey_mdlsurveytemp_mdlsurveytemplate_id_34bee454_fk_survey_md FOREIGN KEY (mdlsurveytemplate_id) REFERENCES public.survey_mdlsurveytemplate(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveytemplate_posters survey_mdlsurveytemp_mdlsurveytemplate_id_415c5d4b_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplate_posters
    ADD CONSTRAINT survey_mdlsurveytemp_mdlsurveytemplate_id_415c5d4b_fk_survey_md FOREIGN KEY (mdlsurveytemplate_id) REFERENCES public.survey_mdlsurveytemplate(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveytemplate_questions survey_mdlsurveytemp_mdlsurveytemplate_id_5df504e7_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplate_questions
    ADD CONSTRAINT survey_mdlsurveytemp_mdlsurveytemplate_id_5df504e7_fk_survey_md FOREIGN KEY (mdlsurveytemplate_id) REFERENCES public.survey_mdlsurveytemplate(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveytemplate_shared_clients survey_mdlsurveytemp_mdlsurveytemplate_id_87f61550_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplate_shared_clients
    ADD CONSTRAINT survey_mdlsurveytemp_mdlsurveytemplate_id_87f61550_fk_survey_md FOREIGN KEY (mdlsurveytemplate_id) REFERENCES public.survey_mdlsurveytemplate(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveytemplate_translations survey_mdlsurveytemp_mdlsurveytemplate_id_ca777186_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplate_translations
    ADD CONSTRAINT survey_mdlsurveytemp_mdlsurveytemplate_id_ca777186_fk_survey_md FOREIGN KEY (mdlsurveytemplate_id) REFERENCES public.survey_mdlsurveytemplate(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveytemplate_supported_languages survey_mdlsurveytemp_mdlsurveytemplate_id_f4e315b0_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplate_supported_languages
    ADD CONSTRAINT survey_mdlsurveytemp_mdlsurveytemplate_id_f4e315b0_fk_survey_md FOREIGN KEY (mdlsurveytemplate_id) REFERENCES public.survey_mdlsurveytemplate(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveytemplate_posters survey_mdlsurveytemp_mdlsurveytemplatepos_6c4d7595_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplate_posters
    ADD CONSTRAINT survey_mdlsurveytemp_mdlsurveytemplatepos_6c4d7595_fk_survey_md FOREIGN KEY (mdlsurveytemplateposters_id) REFERENCES public.survey_mdlsurveytemplateposters(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveytemplatequestionoptions_option_translations survey_mdlsurveytemp_mdlsurveytemplateque_1b0d1e49_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplatequestionoptions_option_translations
    ADD CONSTRAINT survey_mdlsurveytemp_mdlsurveytemplateque_1b0d1e49_fk_survey_md FOREIGN KEY (mdlsurveytemplatequestionoptionstranslations_id) REFERENCES public.survey_mdlsurveytemplatequestionoptionstranslations(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveytemplatequestion_translations survey_mdlsurveytemp_mdlsurveytemplateque_2a50eacf_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplatequestion_translations
    ADD CONSTRAINT survey_mdlsurveytemp_mdlsurveytemplateque_2a50eacf_fk_survey_md FOREIGN KEY (mdlsurveytemplatequestion_id) REFERENCES public.survey_mdlsurveytemplatequestion(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveytemplatequestion_question_options survey_mdlsurveytemp_mdlsurveytemplateque_31a81c5f_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplatequestion_question_options
    ADD CONSTRAINT survey_mdlsurveytemp_mdlsurveytemplateque_31a81c5f_fk_survey_md FOREIGN KEY (mdlsurveytemplatequestionoptions_id) REFERENCES public.survey_mdlsurveytemplatequestionoptions(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveytemplate_questions survey_mdlsurveytemp_mdlsurveytemplateque_4e441fc2_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplate_questions
    ADD CONSTRAINT survey_mdlsurveytemp_mdlsurveytemplateque_4e441fc2_fk_survey_md FOREIGN KEY (mdlsurveytemplatequestion_id) REFERENCES public.survey_mdlsurveytemplatequestion(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveytemplatequestion_question_options survey_mdlsurveytemp_mdlsurveytemplateque_5119728e_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplatequestion_question_options
    ADD CONSTRAINT survey_mdlsurveytemp_mdlsurveytemplateque_5119728e_fk_survey_md FOREIGN KEY (mdlsurveytemplatequestion_id) REFERENCES public.survey_mdlsurveytemplatequestion(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveytemplatequestion_translations survey_mdlsurveytemp_mdlsurveytemplateque_7d1165c3_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplatequestion_translations
    ADD CONSTRAINT survey_mdlsurveytemp_mdlsurveytemplateque_7d1165c3_fk_survey_md FOREIGN KEY (mdlsurveytemplatequestiontranslations_id) REFERENCES public.survey_mdlsurveytemplatequestiontranslations(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveytemplatequestion_reporting_categories survey_mdlsurveytemp_mdlsurveytemplateque_d2f4747a_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplatequestion_reporting_categories
    ADD CONSTRAINT survey_mdlsurveytemp_mdlsurveytemplateque_d2f4747a_fk_survey_md FOREIGN KEY (mdlsurveytemplatequestion_id) REFERENCES public.survey_mdlsurveytemplatequestion(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveytemplatequestionoptions_option_translations survey_mdlsurveytemp_mdlsurveytemplateque_fba0efa8_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplatequestionoptions_option_translations
    ADD CONSTRAINT survey_mdlsurveytemp_mdlsurveytemplateque_fba0efa8_fk_survey_md FOREIGN KEY (mdlsurveytemplatequestionoptions_id) REFERENCES public.survey_mdlsurveytemplatequestionoptions(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveytemplate_translations survey_mdlsurveytemp_mdlsurveytemplatetra_88e3b822_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplate_translations
    ADD CONSTRAINT survey_mdlsurveytemp_mdlsurveytemplatetra_88e3b822_fk_survey_md FOREIGN KEY (mdlsurveytemplatetranslations_id) REFERENCES public.survey_mdlsurveytemplatetranslations(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveytemplatequestion survey_mdlsurveytemp_q_type_id_601d8f4a_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytemplatequestion
    ADD CONSTRAINT survey_mdlsurveytemp_q_type_id_601d8f4a_fk_survey_md FOREIGN KEY (q_type_id) REFERENCES public.survey_mdlsurveyquestiontype(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveytitletranslations survey_mdlsurveytitl_language_id_d4eae627_fk_translati; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveytitletranslations
    ADD CONSTRAINT survey_mdlsurveytitl_language_id_d4eae627_fk_translati FOREIGN KEY (language_id) REFERENCES public.translations_mdlsupportedlanguages(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyuserresponses survey_mdlsurveyuser_language_id_79d86634_fk_translati; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyuserresponses
    ADD CONSTRAINT survey_mdlsurveyuser_language_id_79d86634_fk_translati FOREIGN KEY (language_id) REFERENCES public.translations_mdlsupportedlanguages(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_mdlsurveyuserresponses survey_mdlsurveyuser_survey_id_id_07f101c0_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_mdlsurveyuserresponses
    ADD CONSTRAINT survey_mdlsurveyuser_survey_id_id_07f101c0_fk_survey_md FOREIGN KEY (survey_id_id) REFERENCES public.survey_mdlsurvey(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_surveyhistory survey_surveyhistory_survey_id_34874e4f_fk_survey_mdlsurvey_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_surveyhistory
    ADD CONSTRAINT survey_surveyhistory_survey_id_34874e4f_fk_survey_mdlsurvey_id FOREIGN KEY (survey_id) REFERENCES public.survey_mdlsurvey(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_surveyinvite survey_surveyinvite_survey_id_ffed5651_fk_survey_mdlsurvey_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_surveyinvite
    ADD CONSTRAINT survey_surveyinvite_survey_id_ffed5651_fk_survey_mdlsurvey_id FOREIGN KEY (survey_id) REFERENCES public.survey_mdlsurvey(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_surveyinvite survey_surveyinvite_task_id_4593a8d4_fk_django_celery_task_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_surveyinvite
    ADD CONSTRAINT survey_surveyinvite_task_id_4593a8d4_fk_django_celery_task_id FOREIGN KEY (task_id) REFERENCES public.django_celery_task(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_surveyinvitesworkers survey_surveyinvites_survey_id_3d210cb4_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_surveyinvitesworkers
    ADD CONSTRAINT survey_surveyinvites_survey_id_3d210cb4_fk_survey_md FOREIGN KEY (survey_id) REFERENCES public.survey_mdlsurvey(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_surveyinvitesworkers survey_surveyinvites_survey_invite_id_d203f551_fk_survey_su; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_surveyinvitesworkers
    ADD CONSTRAINT survey_surveyinvites_survey_invite_id_d203f551_fk_survey_su FOREIGN KEY (survey_invite_id) REFERENCES public.survey_surveyinvite(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_template_active_languages survey_template_acti_supportedlanguages_i_b953a33a_fk_translati; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_template_active_languages
    ADD CONSTRAINT survey_template_acti_supportedlanguages_i_b953a33a_fk_translati FOREIGN KEY (supportedlanguages_id) REFERENCES public.translations_mdlsupportedlanguages(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: survey_template_active_languages survey_template_acti_surveytemplate_id_0b735013_fk_survey_md; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.survey_template_active_languages
    ADD CONSTRAINT survey_template_acti_surveytemplate_id_0b735013_fk_survey_md FOREIGN KEY (surveytemplate_id) REFERENCES public.survey_mdlsurveytemplate(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: translations_mdlsupportedlanguages_fonts translations_mdlsupp_mdllanguagefonts_id_fcb35fc2_fk_mdl_langu; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.translations_mdlsupportedlanguages_fonts
    ADD CONSTRAINT translations_mdlsupp_mdllanguagefonts_id_fcb35fc2_fk_mdl_langu FOREIGN KEY (mdllanguagefonts_id) REFERENCES public.mdl_language_fonts(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: translations_mdlsupportedlanguages_fonts translations_mdlsupp_mdlsupportedlanguage_6025b0d9_fk_translati; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.translations_mdlsupportedlanguages_fonts
    ADD CONSTRAINT translations_mdlsupp_mdlsupportedlanguage_6025b0d9_fk_translati FOREIGN KEY (mdlsupportedlanguages_id) REFERENCES public.translations_mdlsupportedlanguages(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: translations_mdltranslations translations_mdltran_dictionary_id_c5151075_fk_translati; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.translations_mdltranslations
    ADD CONSTRAINT translations_mdltran_dictionary_id_c5151075_fk_translati FOREIGN KEY (dictionary_id) REFERENCES public.translations_mdltranslationconfig(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: translations_mdltranslations translations_mdltran_language_id_2879f799_fk_translati; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.translations_mdltranslations
    ADD CONSTRAINT translations_mdltran_language_id_2879f799_fk_translati FOREIGN KEY (language_id) REFERENCES public.translations_mdlsupportedlanguages(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: user_roles_mdluseraccessrolemoduleconfig user_roles_mdluserac_module_id_id_c14c343c_fk_user_role; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles_mdluseraccessrolemoduleconfig
    ADD CONSTRAINT user_roles_mdluserac_module_id_id_c14c343c_fk_user_role FOREIGN KEY (module_id_id) REFERENCES public.user_roles_mdluseraccessmodule(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: user_roles_mdluseraccessrole user_roles_mdluserac_parent_id_64c76caa_fk_user_role; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles_mdluseraccessrole
    ADD CONSTRAINT user_roles_mdluserac_parent_id_64c76caa_fk_user_role FOREIGN KEY (parent_id) REFERENCES public.user_roles_mdluseraccessrole(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: user_roles_mdluseraccessmodule user_roles_mdluserac_parent_id_9a76785f_fk_user_role; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles_mdluseraccessmodule
    ADD CONSTRAINT user_roles_mdluserac_parent_id_9a76785f_fk_user_role FOREIGN KEY (parent_id) REFERENCES public.user_roles_mdluseraccessmodule(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: user_roles_mdluseraccessrolemoduleconfig user_roles_mdluserac_role_id_id_248d3eea_fk_user_role; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles_mdluseraccessrolemoduleconfig
    ADD CONSTRAINT user_roles_mdluserac_role_id_id_248d3eea_fk_user_role FOREIGN KEY (role_id_id) REFERENCES public.user_roles_mdluseraccessrole(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: user_roles_mdluseraccessuserroleconfig user_roles_mdluserac_role_id_id_a5164b58_fk_user_role; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles_mdluseraccessuserroleconfig
    ADD CONSTRAINT user_roles_mdluserac_role_id_id_a5164b58_fk_user_role FOREIGN KEY (role_id_id) REFERENCES public.user_roles_mdluseraccessrole(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: user_settings_mdlusersettings user_settings_mdluse_language_id_44cb60ad_fk_translati; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_settings_mdlusersettings
    ADD CONSTRAINT user_settings_mdluse_language_id_44cb60ad_fk_translati FOREIGN KEY (language_id) REFERENCES public.translations_mdlsupportedlanguages(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: user_settings_mdlusersettings user_settings_mdluse_preferred_font_id_94ddfd18_fk_mdl_langu; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_settings_mdlusersettings
    ADD CONSTRAINT user_settings_mdluse_preferred_font_id_94ddfd18_fk_mdl_langu FOREIGN KEY (preferred_font_id) REFERENCES public.mdl_language_fonts(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: worker_contact_resetcontactregistration worker_contact_reset_task_id_c242d215_fk_django_ce; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_contact_resetcontactregistration
    ADD CONSTRAINT worker_contact_reset_task_id_c242d215_fk_django_ce FOREIGN KEY (task_id) REFERENCES public.django_celery_task(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: worker_contact_resetcontactregistration worker_contact_reset_uploaded_file_id_5b6bb706_fk_worker_co; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.worker_contact_resetcontactregistration
    ADD CONSTRAINT worker_contact_reset_uploaded_file_id_5b6bb706_fk_worker_co FOREIGN KEY (uploaded_file_id) REFERENCES public.worker_contact_resetcontactregistrationfile(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: wovo_import_mdlclientusers wovo_import_mdlclien_client_id_064d30d5_fk_clients_c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wovo_import_mdlclientusers
    ADD CONSTRAINT wovo_import_mdlclien_client_id_064d30d5_fk_clients_c FOREIGN KEY (client_id) REFERENCES public.clients_clientinfo(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c; Type: PUBLICATION; Schema: -; Owner: postgres
--

CREATE PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c WITH (publish = 'insert, update, delete, truncate', publish_via_partition_root = true);


ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c OWNER TO postgres;

--
-- Name: peerflow_pub_survey_data_mirror; Type: PUBLICATION; Schema: -; Owner: postgres
--

CREATE PUBLICATION peerflow_pub_survey_data_mirror WITH (publish = 'insert, update, delete, truncate', publish_via_partition_root = true);


ALTER PUBLICATION peerflow_pub_survey_data_mirror OWNER TO postgres;

--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c authentication_avatar; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.authentication_avatar;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c authentication_contactinfo; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.authentication_contactinfo;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c authentication_module; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.authentication_module;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c authentication_role; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.authentication_role;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c authentication_roleassociatedmodule; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.authentication_roleassociatedmodule;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c authentication_secretquestion; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.authentication_secretquestion;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c authentication_user; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.authentication_user;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c authentication_userassociatedclient; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.authentication_userassociatedclient;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c authentication_userassociateddevice; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.authentication_userassociateddevice;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c authentication_usersettings; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.authentication_usersettings;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c clients_clientinfo; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.clients_clientinfo;


--
-- Name: peerflow_pub_survey_data_mirror clients_clientinfo; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_survey_data_mirror ADD TABLE ONLY public.clients_clientinfo;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c clients_clientinfoassociatedmodule; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.clients_clientinfoassociatedmodule;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c clients_clientinfocustomfielddata; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.clients_clientinfocustomfielddata;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c clients_clientinfotorelationmapping; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.clients_clientinfotorelationmapping;


--
-- Name: peerflow_pub_survey_data_mirror clients_clientinfotorelationmapping; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_survey_data_mirror ADD TABLE ONLY public.clients_clientinfotorelationmapping;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c clients_clientrelation; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.clients_clientrelation;


--
-- Name: peerflow_pub_survey_data_mirror clients_clientrelation; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_survey_data_mirror ADD TABLE ONLY public.clients_clientrelation;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c clients_country; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.clients_country;


--
-- Name: peerflow_pub_survey_data_mirror clients_country; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_survey_data_mirror ADD TABLE ONLY public.clients_country;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c clients_customfield; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.clients_customfield;


--
-- Name: peerflow_pub_survey_data_mirror clients_customfield; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_survey_data_mirror ADD TABLE ONLY public.clients_customfield;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c clients_optionvalue; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.clients_optionvalue;


--
-- Name: peerflow_pub_survey_data_mirror clients_optionvalue; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_survey_data_mirror ADD TABLE ONLY public.clients_optionvalue;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c mdl_client_custom_field_values; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.mdl_client_custom_field_values;


--
-- Name: peerflow_pub_survey_data_mirror mdl_client_custom_field_values; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_survey_data_mirror ADD TABLE ONLY public.mdl_client_custom_field_values;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c mdl_client_custom_fields; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.mdl_client_custom_fields;


--
-- Name: peerflow_pub_survey_data_mirror mdl_client_custom_fields; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_survey_data_mirror ADD TABLE ONLY public.mdl_client_custom_fields;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c mdl_survey_option_bank; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.mdl_survey_option_bank;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c mdl_survey_option_bank_option_translations; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.mdl_survey_option_bank_option_translations;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c mdl_survey_option_bank_options; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.mdl_survey_option_bank_options;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c mdl_survey_option_bank_optionss; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.mdl_survey_option_bank_optionss;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c mdl_survey_option_bank_optionss_option_translations; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.mdl_survey_option_bank_optionss_option_translations;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c mdl_survey_option_bank_title_translations; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.mdl_survey_option_bank_title_translations;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c mdl_survey_option_bank_translations; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.mdl_survey_option_bank_translations;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurvey; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurvey;


--
-- Name: peerflow_pub_survey_data_mirror survey_mdlsurvey; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_survey_data_mirror ADD TABLE ONLY public.survey_mdlsurvey;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurvey_active_languages; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurvey_active_languages;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurvey_posters; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurvey_posters;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurvey_questions; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurvey_questions;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurvey_reporting_categories; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurvey_reporting_categories;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurvey_shared_clients; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurvey_shared_clients;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurvey_supported_languages; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurvey_supported_languages;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurvey_template_supported_languages; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurvey_template_supported_languages;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurvey_translations; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurvey_translations;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveyclientquestiontemplateconfig; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveyclientquestiontemplateconfig;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveyclientquestiontemplateconfig_client_id; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveyclientquestiontemplateconfig_client_id;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveyclosingmessage; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveyclosingmessage;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveyclosingmessage_translation; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveyclosingmessage_translation;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveyclosingmessagetranslations; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveyclosingmessagetranslations;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveyopeningmessage; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveyopeningmessage;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveyopeningmessage_translation; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveyopeningmessage_translation;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveyopeningmessagetranslations; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveyopeningmessagetranslations;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveyposters; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveyposters;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveyquestioncategory; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveyquestioncategory;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveyquestioncategory_client_id; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveyquestioncategory_client_id;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveyquestionoptions; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveyquestionoptions;


--
-- Name: peerflow_pub_survey_data_mirror survey_mdlsurveyquestionoptions; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_survey_data_mirror ADD TABLE ONLY public.survey_mdlsurveyquestionoptions;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveyquestionoptions_option_translations; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveyquestionoptions_option_translations;


--
-- Name: peerflow_pub_survey_data_mirror survey_mdlsurveyquestionoptions_option_translations; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_survey_data_mirror ADD TABLE ONLY public.survey_mdlsurveyquestionoptions_option_translations;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveyquestionoptionsmedia; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveyquestionoptionsmedia;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveyquestionoptionsmedia_client_id; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveyquestionoptionsmedia_client_id;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveyquestionoptiontranslations; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveyquestionoptiontranslations;


--
-- Name: peerflow_pub_survey_data_mirror survey_mdlsurveyquestionoptiontranslations; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_survey_data_mirror ADD TABLE ONLY public.survey_mdlsurveyquestionoptiontranslations;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveyquestionresponses; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveyquestionresponses;


--
-- Name: peerflow_pub_survey_data_mirror survey_mdlsurveyquestionresponses; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_survey_data_mirror ADD TABLE ONLY public.survey_mdlsurveyquestionresponses;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveyquestions; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveyquestions;


--
-- Name: peerflow_pub_survey_data_mirror survey_mdlsurveyquestions; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_survey_data_mirror ADD TABLE ONLY public.survey_mdlsurveyquestions;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveyquestions_question_options; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveyquestions_question_options;


--
-- Name: peerflow_pub_survey_data_mirror survey_mdlsurveyquestions_question_options; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_survey_data_mirror ADD TABLE ONLY public.survey_mdlsurveyquestions_question_options;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveyquestions_reporting_categories; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveyquestions_reporting_categories;


--
-- Name: peerflow_pub_survey_data_mirror survey_mdlsurveyquestions_reporting_categories; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_survey_data_mirror ADD TABLE ONLY public.survey_mdlsurveyquestions_reporting_categories;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveyquestions_translations; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveyquestions_translations;


--
-- Name: peerflow_pub_survey_data_mirror survey_mdlsurveyquestions_translations; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_survey_data_mirror ADD TABLE ONLY public.survey_mdlsurveyquestions_translations;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveyquestiontemplate; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveyquestiontemplate;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveyquestiontemplate_client_id; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveyquestiontemplate_client_id;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveyquestiontemplatemedia; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveyquestiontemplatemedia;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveyquestiontemplatemedia_client_id; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveyquestiontemplatemedia_client_id;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveyquestiontemplatetranslations; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveyquestiontemplatetranslations;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveyquestiontemplatetranslations_client_id; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveyquestiontemplatetranslations_client_id;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveyquestiontemplatetypeconfig; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveyquestiontemplatetypeconfig;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveyquestiontemplatetypeconfig_client_id; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveyquestiontemplatetypeconfig_client_id;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveyquestiontranslations; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveyquestiontranslations;


--
-- Name: peerflow_pub_survey_data_mirror survey_mdlsurveyquestiontranslations; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_survey_data_mirror ADD TABLE ONLY public.survey_mdlsurveyquestiontranslations;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveyquestiontype; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveyquestiontype;


--
-- Name: peerflow_pub_survey_data_mirror survey_mdlsurveyquestiontype; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_survey_data_mirror ADD TABLE ONLY public.survey_mdlsurveyquestiontype;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveyquestiontypeoptions; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveyquestiontypeoptions;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveyreportingcategory; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveyreportingcategory;


--
-- Name: peerflow_pub_survey_data_mirror survey_mdlsurveyreportingcategory; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_survey_data_mirror ADD TABLE ONLY public.survey_mdlsurveyreportingcategory;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveyreportingcategory_supported_languages; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveyreportingcategory_supported_languages;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveyreportingcategory_translations; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveyreportingcategory_translations;


--
-- Name: peerflow_pub_survey_data_mirror survey_mdlsurveyreportingcategory_translations; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_survey_data_mirror ADD TABLE ONLY public.survey_mdlsurveyreportingcategory_translations;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveyreportingcategorytranslations; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveyreportingcategorytranslations;


--
-- Name: peerflow_pub_survey_data_mirror survey_mdlsurveyreportingcategorytranslations; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_survey_data_mirror ADD TABLE ONLY public.survey_mdlsurveyreportingcategorytranslations;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveytemplate; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveytemplate;


--
-- Name: peerflow_pub_survey_data_mirror survey_mdlsurveytemplate; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_survey_data_mirror ADD TABLE ONLY public.survey_mdlsurveytemplate;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveytemplate_posters; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveytemplate_posters;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveytemplate_questions; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveytemplate_questions;


--
-- Name: peerflow_pub_survey_data_mirror survey_mdlsurveytemplate_questions; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_survey_data_mirror ADD TABLE ONLY public.survey_mdlsurveytemplate_questions;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveytemplate_reporting_categories; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveytemplate_reporting_categories;


--
-- Name: peerflow_pub_survey_data_mirror survey_mdlsurveytemplate_reporting_categories; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_survey_data_mirror ADD TABLE ONLY public.survey_mdlsurveytemplate_reporting_categories;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveytemplate_shared_clients; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveytemplate_shared_clients;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveytemplate_supported_languages; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveytemplate_supported_languages;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveytemplate_translations; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveytemplate_translations;


--
-- Name: peerflow_pub_survey_data_mirror survey_mdlsurveytemplate_translations; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_survey_data_mirror ADD TABLE ONLY public.survey_mdlsurveytemplate_translations;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveytemplateposters; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveytemplateposters;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveytemplatequestion; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveytemplatequestion;


--
-- Name: peerflow_pub_survey_data_mirror survey_mdlsurveytemplatequestion; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_survey_data_mirror ADD TABLE ONLY public.survey_mdlsurveytemplatequestion;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveytemplatequestion_question_options; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveytemplatequestion_question_options;


--
-- Name: peerflow_pub_survey_data_mirror survey_mdlsurveytemplatequestion_question_options; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_survey_data_mirror ADD TABLE ONLY public.survey_mdlsurveytemplatequestion_question_options;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveytemplatequestion_reporting_categories; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveytemplatequestion_reporting_categories;


--
-- Name: peerflow_pub_survey_data_mirror survey_mdlsurveytemplatequestion_reporting_categories; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_survey_data_mirror ADD TABLE ONLY public.survey_mdlsurveytemplatequestion_reporting_categories;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveytemplatequestion_translations; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveytemplatequestion_translations;


--
-- Name: peerflow_pub_survey_data_mirror survey_mdlsurveytemplatequestion_translations; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_survey_data_mirror ADD TABLE ONLY public.survey_mdlsurveytemplatequestion_translations;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveytemplatequestionoptions; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveytemplatequestionoptions;


--
-- Name: peerflow_pub_survey_data_mirror survey_mdlsurveytemplatequestionoptions; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_survey_data_mirror ADD TABLE ONLY public.survey_mdlsurveytemplatequestionoptions;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveytemplatequestionoptions_option_translations; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveytemplatequestionoptions_option_translations;


--
-- Name: peerflow_pub_survey_data_mirror survey_mdlsurveytemplatequestionoptions_option_translations; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_survey_data_mirror ADD TABLE ONLY public.survey_mdlsurveytemplatequestionoptions_option_translations;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveytemplatequestionoptionstranslations; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveytemplatequestionoptionstranslations;


--
-- Name: peerflow_pub_survey_data_mirror survey_mdlsurveytemplatequestionoptionstranslations; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_survey_data_mirror ADD TABLE ONLY public.survey_mdlsurveytemplatequestionoptionstranslations;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveytemplatequestiontranslations; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveytemplatequestiontranslations;


--
-- Name: peerflow_pub_survey_data_mirror survey_mdlsurveytemplatequestiontranslations; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_survey_data_mirror ADD TABLE ONLY public.survey_mdlsurveytemplatequestiontranslations;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveytemplatetranslations; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveytemplatetranslations;


--
-- Name: peerflow_pub_survey_data_mirror survey_mdlsurveytemplatetranslations; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_survey_data_mirror ADD TABLE ONLY public.survey_mdlsurveytemplatetranslations;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveytitletranslations; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveytitletranslations;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_mdlsurveyuserresponses; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_mdlsurveyuserresponses;


--
-- Name: peerflow_pub_survey_data_mirror survey_mdlsurveyuserresponses; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_survey_data_mirror ADD TABLE ONLY public.survey_mdlsurveyuserresponses;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_surveyhistory; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_surveyhistory;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_surveyinvite; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_surveyinvite;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_surveyinvitesworkers; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_surveyinvitesworkers;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c survey_template_active_languages; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.survey_template_active_languages;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c translations_mdlsupportedlanguages; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.translations_mdlsupportedlanguages;


--
-- Name: peerflow_pub_survey_data_mirror translations_mdlsupportedlanguages; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_survey_data_mirror ADD TABLE ONLY public.translations_mdlsupportedlanguages;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c translations_mdltranslationconfig; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.translations_mdltranslationconfig;


--
-- Name: peerflow_pub_survey_data_mirror translations_mdltranslationconfig; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_survey_data_mirror ADD TABLE ONLY public.translations_mdltranslationconfig;


--
-- Name: peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c translations_mdltranslations; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_mirror_8440b6ee__af6e__42ed__bf1f__12a0027b111c ADD TABLE ONLY public.translations_mdltranslations;


--
-- Name: peerflow_pub_survey_data_mirror translations_mdltranslations; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION peerflow_pub_survey_data_mirror ADD TABLE ONLY public.translations_mdltranslations;


--
-- PostgreSQL database dump complete
--

\unrestrict nwqCiUHC0ZqVdJx8j24Hj44RxWaJIHjfBRKq6xB9vjc3dbhrnGXqpoxFCL8ert5

