# sfdx-plugin-package-xml

> explore metadata in an org and generate a package.xml manifest

> DISCLAIMER: This is a **beta** version with only a few features.
>
> Please submit issues with your feedback about errors, usability and feature requests.

> sfdx/sf plugin for generating a package.xml manifest

[![Actions Status](https://github.com/amtrack/sfdx-plugin-package-xml/actions/workflows/default.yml/badge.svg?branch=beta)](https://github.com/amtrack/sfdx-plugin-package-xml/actions?query=branch:beta)

## Installation

```console
sf plugins install sfdx-plugin-package-xml@beta
```

## Usage

Commands

```console
sf force mdapi listallmetadata -h
sf package.xml generate -h
```

> :warning: Note: The first command is similar to the official (`sf force mdapi listmetadata`) command.
>
> However our command lists Metadata for **ALL** Metadata Types.
>
> ```diff
> -force mdapi listmetadata
> +force mdapi listallmetadata
> ```

## Use Cases

Retrieve all Metadata from an org named `acme-dev` (a.k.a "Metadata Backup", a.k.a. "sf force org pull")

```console
sf force mdapi listallmetadata -f /tmp/fileproperties.json -o acme-dev
sf package.xml generate -j /tmp/fileproperties.json -f package.xml --api-version 54.0
sf project retrieve start --manifest package.xml -o acme-dev
```

Explore Metadata in an org named `acme-dev`

```console
sf force mdapi listallmetadata --names -o acme-dev
# include child Metadata such as CustomField and filter for CustomFields on Account
sf force mdapi listallmetadata --children --names -o acme-dev | grep "CustomField:Account."
```

## Concept and Implementation

### Listing Metadata

General Approach:

- call [describeMetadata()](https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_describe.htm) to retrieve a list of Metadata Types
- call [listMetadata()](https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_listmetadata.htm) for all Metadata Types (in chunks of max. 3 queries to adhere to the limits)
- list all folders and folder-based Metadata
- list `StandardValueSet`s using a workaround because of a bug
- optionally list all child Metadata Types (e.g. `CustomField` of `CustomObject`, `CustomLabel` of `CustomLabels`)

Workarounds:

There are a bunch of issues with `listMetadata`. The following repositories provide Minimum Working Examples and Workarounds we use:

- https://github.com/mdapi-issues/listmetadata-recordtype-personaccount
- https://github.com/mdapi-issues/listmetadata-standardvalueset
- https://github.com/mdapi-issues/listmetadata-standardvaluesettranslation-type
- https://github.com/mdapi-issues/listmetadata-installed-missing-namespaceprefix

### Component Names and Patterns

Component Names and Patterns have the following format: `<type>:<fullName>`

Examples:

```
CustomField:Account.Industry
CustomField:Account.*
ReportFolder:unfiled$public
Report:unfiled$public/
ApexClass:Test_*
ApexClass:*Test
ApexClass:ACME__*
```

For convenience you can also write `CustomField` instead of `CustomField:*`.

They are used throughout this plugin, e.g. in the

- output of `sf force mdapi listallmetadata --names`
- component names (allow rules) in `sf force mdapi listallmetadata --metadata`
- ignore rules in `sf force mdapi listallmetadata --ignore` and `sf package.xml generate --ignore`

### Filtering Metadata

There are some predefined filters to either **filter** or **exclude** certain metadata components:

- unmanaged
- unlocked
- managed
- managedreadonly
- managedwriteable

Examples:

1. To **only** list CustomObjects belonging to a Managed Package Unlocked Package:

```console
sf force mdapi listallmetadata -m "CustomObject" --managed --unlocked --names
sf force mdapi listallmetadata -m "CustomObject" --no-unmanaged --names
```

2. To list CustomObjects **except** the ones belonging to a Managed Package OR Unlocked Package:

```console
sf force mdapi listallmetadata -m "CustomObject" --unmanaged --names
sf force mdapi listallmetadata -m "CustomObject" --no-managed --no-unlocked --names
```

### Package.xml

The `package.xml` file follows a certain format (indentation, sort order).
You can discover this when using an unformatted `package.xml` to retrieve Metadata.
The returned zip file contains a well formatted `package.xml`.
We try to stick to this format to make working with version control systems more easy.
