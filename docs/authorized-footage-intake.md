# Authorized footage intake scaffold

## Purpose

This document explains the **future-safe intake and storage scaffold** for authorized municipal pilot footage.

It does **not** enable public video uploads in the current alpha.

## What public alpha supports

- mock AI by default
- synthetic demo scenarios
- metadata-only uploaded-video jobs
- metadata-only authorized footage intake records
- disabled-by-default controlled upload URL requests

## What controlled pilot mode would support

With explicit environment flags and private storage configured, the platform could support:

- intake records for authorized pilot footage
- short-lived upload URL issuance
- private object storage outside GitHub
- worker processing by storage object reference
- privacy masking before evidence persistence

## Required authorization checklist

- written permission from municipality / traffic department / ward office
- defined road or junction scope
- defined time window
- named authorization contact
- retention period agreed
- privacy masking requirement agreed
- human review requirement agreed

## Storage provider requirements

- uploads disabled by default
- private bucket or equivalent object storage
- short-lived signed URLs
- no local repo writes
- no public raw footage URLs

## Retention policy

Recommended pilot default:

- 30-day retention unless authority requires shorter
- delete expired footage references promptly
- keep audit notes for why footage was retained

## Privacy masking requirement

Any real pilot footage should enforce:

- face blur
- plate masking
- restricted reviewer access
- masking before evidence persistence

This is privacy protection only, not identity recognition.

## Why raw footage is not committed to GitHub

- GitHub is not the right place for restricted pilot footage
- repositories are difficult to treat as secure evidence storage
- retention, deletion, and access control are not sufficient for municipal pilot needs

## Why random CCTV scraping is not allowed

- no proof of permission
- unclear ownership and legal basis
- high privacy and compliance risk
- outside the project’s stated pilot scope

## Why live CCTV / RTSP is not Phase 2A

- live ingest increases infrastructure and legal complexity sharply
- pilot validation should start with bounded uploaded clips
- privacy, retention, and review rules are easier to enforce on uploaded authorized clips

## Recommended first pilot

- one road
- one junction
- uploaded authorized clips only
- three issue types:
  - waterlogging
  - garbage overflow
  - illegal parking / road blockage
- human review only
