-- Schema base para SIGE-PLUS

create extension if not exists "uuid-ossp";

create table if not exists carreras (
    id uuid primary key default uuid_generate_v4 (),
    nombre text not null
);

create table if not exists periodos (
    id uuid primary key default uuid_generate_v4 (),
    nombre text not null,
    activo boolean not null default false
);

create table if not exists estudiantes (
    id uuid primary key default uuid_generate_v4 (),
    matricula text not null unique,
    nombre text not null,
    apellido_paterno text not null,
    apellido_materno text,
    curp text,
    email text not null unique,
    password text not null,
    carrera_id uuid references carreras (id),
    creado_en timestamptz not null default now()
);

create table if not exists pagos (
    id uuid primary key default uuid_generate_v4 (),
    estudiante_id uuid not null references estudiantes (id) on delete cascade,
    periodo_id uuid references periodos (id),
    estado text not null default 'pendiente',
    creado_en timestamptz not null default now()
);

create table if not exists sige_datos_respaldo (
    id uuid primary key default uuid_generate_v4 (),
    matricula text not null,
    datos_personales jsonb,
    historial_academico jsonb,
    calificaciones_actuales jsonb,
    adeudos jsonb,
    fecha_sincronizacion timestamptz not null default now(),
    exitosa boolean not null default true,
    mensaje_error text
);

create table if not exists sige_historial_materias (
    id uuid primary key default uuid_generate_v4 (),
    matricula text not null,
    nombre_materia text not null,
    calificacion_texto text,
    calificacion_numerica numeric(5, 2),
    creditos numeric(5, 2),
    periodo text,
    profesor text,
    cuatrimestre text,
    grupo text,
    fecha_extraccion timestamptz not null default now()
);

create table if not exists sige_adeudos (
    id uuid primary key default uuid_generate_v4 (),
    matricula text not null,
    concepto text not null,
    descripcion text,
    monto_texto text,
    monto_decimal numeric(10, 2),
    recargos_texto text,
    recargos_decimal numeric(10, 2),
    fecha_limite_texto text,
    estatus text not null default 'PENDIENTE',
    resuelto boolean not null default false,
    fecha_extraccion timestamptz not null default now()
);

create table if not exists pagos_mensuales (
    id uuid primary key default uuid_generate_v4 (),
    matricula text not null references estudiantes (matricula) on delete cascade,
    mes text not null,
    monto_base numeric(10, 2) not null default 250.00,
    recargo_aplicado numeric(10, 2) not null default 0.00,
    total_pagado numeric(10, 2) not null,
    concepto text default 'Pago de mensualidad',
    folio_recibo text unique,
    estado text default 'pagado',
    fecha_pago timestamptz,
    fecha_creacion timestamptz not null default now(),
    fecha_actualizacion timestamptz not null default now()
);