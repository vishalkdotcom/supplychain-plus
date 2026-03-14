\connect wc_global

--
-- PostgreSQL database dump
--


-- Dumped from database version 16.13 (Debian 16.13-1.pgdg12+1)
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
-- SET transaction_timeout = 0; -- PG17 only
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


-- ALTER SCHEMA public OWNER TO pguser;

--
-- Name: prevent_duplicate_insert_of_active_employee_id(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.prevent_duplicate_insert_of_active_employee_id() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Check if there's an existing active record with the same client, identifier, and emp_id
    IF EXISTS (
        SELECT 1
        FROM public.mdl_participant
        WHERE client_id = NEW.client_id
            --AND identifier = NEW.identifier
            AND employee_id = NEW.employee_id
            AND is_active = TRUE
    ) THEN
        RAISE EXCEPTION 'An active record with the same client and employee_id already exists.';
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.prevent_duplicate_insert_of_active_employee_id() OWNER TO pguser;

--
-- Name: prevent_reactivation_and_update_counter(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.prevent_reactivation_and_update_counter() RETURNS trigger
    LANGUAGE plpgsql
    AS $$BEGIN
    -- Check if there's an existing active record with the same client_id, employee_id
    IF NEW.is_active = TRUE AND EXISTS (
        SELECT 1
        FROM public.mdl_participant
        WHERE client_id = NEW.client_id
            AND employee_id = NEW.employee_id
            AND is_active = TRUE
            AND id <> NEW.id -- Exclude the current record being updated
    ) THEN
        RAISE EXCEPTION 'An active record with the same client_id and employee_id already exists.';
    END IF;

    -- Update the inactive_counter in case of reactivation and deactivation
    IF NOT NEW.is_active THEN
        NEW.inactive_counter = COALESCE(
            (SELECT MAX(inactive_counter) FROM public.mdl_participant WHERE client_id = NEW.client_id AND employee_id = NEW.employee_id AND is_active = FALSE),
            0
        ) + 1;
    ELSE
        NEW.inactive_counter = 0;
    END IF;

    RETURN NEW;
END;$$;


ALTER FUNCTION public.prevent_reactivation_and_update_counter() OWNER TO pguser;

--
-- Name: update_inactive_counter(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_inactive_counter() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.is_active = FALSE THEN
        UPDATE public.mdl_participant
        SET inactive_counter = COALESCE(
            (SELECT MAX(inactive_counter) FROM public.mdl_participant WHERE client_id = NEW.client_id AND employee_id = NEW.employee_id AND is_active = FALSE),
            0
        ) + 1
        WHERE client_id = NEW.client_id AND employee_id = NEW.employee_id AND is_active = FALSE;
    ELSEIF NEW.is_active = TRUE THEN
		UPDATE public.mdl_participant
		SET	inactive_counter = 0  ---set counter 0 when re-activated
		WHERE client_id = NEW.client_id
		AND employee_id = NEW.employee_id
		AND is_active = true;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_inactive_counter() OWNER TO pguser;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: django_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.django_migrations (
    id integer NOT NULL,
    app character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    applied timestamp with time zone NOT NULL
);


ALTER TABLE public.django_migrations OWNER TO pguser;

--
-- Name: django_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.django_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.django_migrations_id_seq OWNER TO pguser;

--
-- Name: django_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.django_migrations_id_seq OWNED BY public.django_migrations.id;


--
-- Name: employee_ids; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_ids (
    array_to_string text
);


ALTER TABLE public.employee_ids OWNER TO pguser;

--
-- Name: mdl_client_custom_field_values; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mdl_client_custom_field_values (
    id integer NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    created_by integer,
    modified_by integer,
    client_id integer NOT NULL,
    name character varying(500),
    custom_field_id bigint NOT NULL,
    is_active boolean NOT NULL,
    ucms_id integer,
    last_sync_time timestamp with time zone
);


ALTER TABLE public.mdl_client_custom_field_values OWNER TO pguser;

--
-- Name: mdl_client_custom_field_values_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mdl_client_custom_field_values_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mdl_client_custom_field_values_id_seq OWNER TO pguser;

--
-- Name: mdl_client_custom_field_values_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mdl_client_custom_field_values_id_seq OWNED BY public.mdl_client_custom_field_values.id;


--
-- Name: mdl_client_custom_fields; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mdl_client_custom_fields (
    id integer NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    created_by integer,
    modified_by integer,
    client_id integer NOT NULL,
    name character varying(500),
    is_active boolean NOT NULL,
    discriminator text NOT NULL,
    ucms_id integer NOT NULL,
    related_to integer,
    area_id integer,
    is_default boolean NOT NULL,
    is_archived boolean NOT NULL,
    last_sync_time timestamp with time zone
);


ALTER TABLE public.mdl_client_custom_fields OWNER TO pguser;

--
-- Name: mdl_client_custom_fields_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mdl_client_custom_fields_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mdl_client_custom_fields_id_seq OWNER TO pguser;

--
-- Name: mdl_client_custom_fields_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mdl_client_custom_fields_id_seq OWNED BY public.mdl_client_custom_fields.id;


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


ALTER TABLE public.mdl_language_fonts OWNER TO pguser;

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
    extension text,
    job_role integer,
    inactive_counter integer DEFAULT 0
);


ALTER TABLE public.mdl_participant OWNER TO pguser;

--
-- Name: mdl_participant_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mdl_participant_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mdl_participant_id_seq OWNER TO pguser;

--
-- Name: mdl_participant_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mdl_participant_id_seq OWNED BY public.mdl_participant.id;


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


ALTER TABLE public.mdl_participant_image OWNER TO pguser;

--
-- Name: mdl_participant_image_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mdl_participant_image_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mdl_participant_image_id_seq OWNER TO pguser;

--
-- Name: mdl_participant_image_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mdl_participant_image_id_seq OWNED BY public.mdl_participant_image.id;


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


ALTER TABLE public.mdl_participants_phone OWNER TO pguser;

--
-- Name: mdl_participants_phone_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mdl_participants_phone_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mdl_participants_phone_id_seq OWNER TO pguser;

--
-- Name: mdl_participants_phone_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mdl_participants_phone_id_seq OWNED BY public.mdl_participants_phone.id;


--
-- Name: mdl_wc_attachment_task; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mdl_wc_attachment_task (
    id integer NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    status integer NOT NULL
);


ALTER TABLE public.mdl_wc_attachment_task OWNER TO pguser;

--
-- Name: mdl_wc_attachment_task_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mdl_wc_attachment_task_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mdl_wc_attachment_task_id_seq OWNER TO pguser;

--
-- Name: mdl_wc_attachment_task_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mdl_wc_attachment_task_id_seq OWNED BY public.mdl_wc_attachment_task.id;


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


ALTER TABLE public.mdl_wc_contact_attachment_content OWNER TO pguser;

--
-- Name: mdl_wc_contact_attachment_content_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mdl_wc_contact_attachment_content_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mdl_wc_contact_attachment_content_id_seq OWNER TO pguser;

--
-- Name: mdl_wc_contact_attachment_content_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mdl_wc_contact_attachment_content_id_seq OWNED BY public.mdl_wc_contact_attachment_content.id;


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


ALTER TABLE public.mdl_wc_contact_attachments OWNER TO pguser;

--
-- Name: mdl_wc_contact_attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mdl_wc_contact_attachments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mdl_wc_contact_attachments_id_seq OWNER TO pguser;

--
-- Name: mdl_wc_contact_attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mdl_wc_contact_attachments_id_seq OWNED BY public.mdl_wc_contact_attachments.id;


--
-- Name: mdl_wc_contact_group_translations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mdl_wc_contact_group_translations (
    id integer NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    "Name" text NOT NULL,
    language_id integer NOT NULL
);


ALTER TABLE public.mdl_wc_contact_group_translations OWNER TO pguser;

--
-- Name: mdl_wc_contact_group_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mdl_wc_contact_group_translations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mdl_wc_contact_group_translations_id_seq OWNER TO pguser;

--
-- Name: mdl_wc_contact_group_translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mdl_wc_contact_group_translations_id_seq OWNED BY public.mdl_wc_contact_group_translations.id;


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


ALTER TABLE public.mdl_wc_contact_groups OWNER TO pguser;

--
-- Name: mdl_wc_contact_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mdl_wc_contact_groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mdl_wc_contact_groups_id_seq OWNER TO pguser;

--
-- Name: mdl_wc_contact_groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mdl_wc_contact_groups_id_seq OWNED BY public.mdl_wc_contact_groups.id;


--
-- Name: mdl_wc_contact_groups_translations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mdl_wc_contact_groups_translations (
    id integer NOT NULL,
    mdlwccontactgroup_id integer NOT NULL,
    mdlwccontactgrouptranslations_id integer NOT NULL
);


ALTER TABLE public.mdl_wc_contact_groups_translations OWNER TO pguser;

--
-- Name: mdl_wc_contact_groups_translations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mdl_wc_contact_groups_translations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mdl_wc_contact_groups_translations_id_seq OWNER TO pguser;

--
-- Name: mdl_wc_contact_groups_translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mdl_wc_contact_groups_translations_id_seq OWNED BY public.mdl_wc_contact_groups_translations.id;


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


ALTER TABLE public.mdl_wc_participant_contact_group_relation OWNER TO pguser;

--
-- Name: mdl_wc_participant_contact_group_relation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mdl_wc_participant_contact_group_relation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mdl_wc_participant_contact_group_relation_id_seq OWNER TO pguser;

--
-- Name: mdl_wc_participant_contact_group_relation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mdl_wc_participant_contact_group_relation_id_seq OWNED BY public.mdl_wc_participant_contact_group_relation.id;


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


ALTER TABLE public.mdl_wc_participant_counter OWNER TO pguser;

--
-- Name: mdl_wc_participant_counter_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mdl_wc_participant_counter_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mdl_wc_participant_counter_id_seq OWNER TO pguser;

--
-- Name: mdl_wc_participant_counter_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mdl_wc_participant_counter_id_seq OWNED BY public.mdl_wc_participant_counter.id;


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


ALTER TABLE public.mdl_wc_participant_custom_field_relation OWNER TO pguser;

--
-- Name: mdl_wc_participant_custom_field_relation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mdl_wc_participant_custom_field_relation_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mdl_wc_participant_custom_field_relation_id_seq OWNER TO pguser;

--
-- Name: mdl_wc_participant_custom_field_relation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mdl_wc_participant_custom_field_relation_id_seq OWNED BY public.mdl_wc_participant_custom_field_relation.id;


--
-- Name: translations_mdlsupportedlanguages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.translations_mdlsupportedlanguages (
    id integer NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    name character varying(50) NOT NULL,
    language_code character varying(50) NOT NULL,
    is_active boolean NOT NULL,
    is_ui_language boolean NOT NULL,
    is_translated boolean NOT NULL,
    is_app_supported boolean NOT NULL,
    resource_version double precision NOT NULL,
    wovo_language_id integer NOT NULL
);


ALTER TABLE public.translations_mdlsupportedlanguages OWNER TO pguser;

--
-- Name: translations_mdlsupportedlanguages_fonts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.translations_mdlsupportedlanguages_fonts (
    id integer NOT NULL,
    mdlsupportedlanguages_id integer NOT NULL,
    mdllanguagefonts_id uuid NOT NULL
);


ALTER TABLE public.translations_mdlsupportedlanguages_fonts OWNER TO pguser;

--
-- Name: translations_mdlsupportedlanguages_fonts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.translations_mdlsupportedlanguages_fonts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.translations_mdlsupportedlanguages_fonts_id_seq OWNER TO pguser;

--
-- Name: translations_mdlsupportedlanguages_fonts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.translations_mdlsupportedlanguages_fonts_id_seq OWNED BY public.translations_mdlsupportedlanguages_fonts.id;


--
-- Name: translations_mdlsupportedlanguages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.translations_mdlsupportedlanguages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.translations_mdlsupportedlanguages_id_seq OWNER TO pguser;

--
-- Name: translations_mdlsupportedlanguages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.translations_mdlsupportedlanguages_id_seq OWNED BY public.translations_mdlsupportedlanguages.id;


--
-- Name: translations_mdltranslationconfig; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.translations_mdltranslationconfig (
    id integer NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    dic_key character varying(255) NOT NULL
);


ALTER TABLE public.translations_mdltranslationconfig OWNER TO pguser;

--
-- Name: translations_mdltranslationconfig_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.translations_mdltranslationconfig_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.translations_mdltranslationconfig_id_seq OWNER TO pguser;

--
-- Name: translations_mdltranslationconfig_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.translations_mdltranslationconfig_id_seq OWNED BY public.translations_mdltranslationconfig.id;


--
-- Name: translations_mdltranslations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.translations_mdltranslations (
    id integer NOT NULL,
    created_date timestamp with time zone,
    modified_date timestamp with time zone,
    created_by character varying(255),
    modified_by character varying(256),
    translation text NOT NULL,
    dictionary_id integer,
    language_id integer
);


ALTER TABLE public.translations_mdltranslations OWNER TO pguser;

--
-- Name: translations_mdltranslations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.translations_mdltranslations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.translations_mdltranslations_id_seq OWNER TO pguser;

--
-- Name: translations_mdltranslations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.translations_mdltranslations_id_seq OWNED BY public.translations_mdltranslations.id;


--
-- Name: django_migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_migrations ALTER COLUMN id SET DEFAULT nextval('public.django_migrations_id_seq'::regclass);


--
-- Name: mdl_client_custom_field_values id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_client_custom_field_values ALTER COLUMN id SET DEFAULT nextval('public.mdl_client_custom_field_values_id_seq'::regclass);


--
-- Name: mdl_client_custom_fields id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_client_custom_fields ALTER COLUMN id SET DEFAULT nextval('public.mdl_client_custom_fields_id_seq'::regclass);


--
-- Name: mdl_participant id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_participant ALTER COLUMN id SET DEFAULT nextval('public.mdl_participant_id_seq'::regclass);


--
-- Name: mdl_participant_image id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_participant_image ALTER COLUMN id SET DEFAULT nextval('public.mdl_participant_image_id_seq'::regclass);


--
-- Name: mdl_participants_phone id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_participants_phone ALTER COLUMN id SET DEFAULT nextval('public.mdl_participants_phone_id_seq'::regclass);


--
-- Name: mdl_wc_attachment_task id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_wc_attachment_task ALTER COLUMN id SET DEFAULT nextval('public.mdl_wc_attachment_task_id_seq'::regclass);


--
-- Name: mdl_wc_contact_attachment_content id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_wc_contact_attachment_content ALTER COLUMN id SET DEFAULT nextval('public.mdl_wc_contact_attachment_content_id_seq'::regclass);


--
-- Name: mdl_wc_contact_attachments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_wc_contact_attachments ALTER COLUMN id SET DEFAULT nextval('public.mdl_wc_contact_attachments_id_seq'::regclass);


--
-- Name: mdl_wc_contact_group_translations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_wc_contact_group_translations ALTER COLUMN id SET DEFAULT nextval('public.mdl_wc_contact_group_translations_id_seq'::regclass);


--
-- Name: mdl_wc_contact_groups id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_wc_contact_groups ALTER COLUMN id SET DEFAULT nextval('public.mdl_wc_contact_groups_id_seq'::regclass);


--
-- Name: mdl_wc_contact_groups_translations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_wc_contact_groups_translations ALTER COLUMN id SET DEFAULT nextval('public.mdl_wc_contact_groups_translations_id_seq'::regclass);


--
-- Name: mdl_wc_participant_contact_group_relation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_wc_participant_contact_group_relation ALTER COLUMN id SET DEFAULT nextval('public.mdl_wc_participant_contact_group_relation_id_seq'::regclass);


--
-- Name: mdl_wc_participant_counter id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_wc_participant_counter ALTER COLUMN id SET DEFAULT nextval('public.mdl_wc_participant_counter_id_seq'::regclass);


--
-- Name: mdl_wc_participant_custom_field_relation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_wc_participant_custom_field_relation ALTER COLUMN id SET DEFAULT nextval('public.mdl_wc_participant_custom_field_relation_id_seq'::regclass);


--
-- Name: translations_mdlsupportedlanguages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.translations_mdlsupportedlanguages ALTER COLUMN id SET DEFAULT nextval('public.translations_mdlsupportedlanguages_id_seq'::regclass);


--
-- Name: translations_mdlsupportedlanguages_fonts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.translations_mdlsupportedlanguages_fonts ALTER COLUMN id SET DEFAULT nextval('public.translations_mdlsupportedlanguages_fonts_id_seq'::regclass);


--
-- Name: translations_mdltranslationconfig id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.translations_mdltranslationconfig ALTER COLUMN id SET DEFAULT nextval('public.translations_mdltranslationconfig_id_seq'::regclass);


--
-- Name: translations_mdltranslations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.translations_mdltranslations ALTER COLUMN id SET DEFAULT nextval('public.translations_mdltranslations_id_seq'::regclass);


--
-- Name: django_migrations django_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_migrations
    ADD CONSTRAINT django_migrations_pkey PRIMARY KEY (id);


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
-- Name: mdl_language_fonts mdl_language_fonts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_language_fonts
    ADD CONSTRAINT mdl_language_fonts_pkey PRIMARY KEY (id);


--
-- Name: mdl_participant mdl_participant_client_id_employee_id_is_79714146_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_participant
    ADD CONSTRAINT mdl_participant_client_id_employee_id_is_79714146_uniq UNIQUE (client_id, employee_id, is_active, inactive_counter);


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
-- Name: mdl_participant before_insert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER before_insert BEFORE INSERT ON public.mdl_participant FOR EACH ROW EXECUTE FUNCTION public.prevent_duplicate_insert_of_active_employee_id();


--
-- Name: mdl_participant before_update; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER before_update BEFORE UPDATE ON public.mdl_participant FOR EACH ROW EXECUTE FUNCTION public.prevent_reactivation_and_update_counter();


--
-- Name: mdl_client_custom_field_values mdl_client_custom_fi_custom_field_id_e2155c5a_fk_mdl_clien; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mdl_client_custom_field_values
    ADD CONSTRAINT mdl_client_custom_fi_custom_field_id_e2155c5a_fk_mdl_clien FOREIGN KEY (custom_field_id) REFERENCES public.mdl_client_custom_fields(id) DEFERRABLE INITIALLY DEFERRED;


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
-- PostgreSQL database dump complete
--


