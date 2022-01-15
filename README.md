# sfdx-plugin-package-xml

> explore metadata in an org and generate a package.xml manifest

> DISCLAIMER: This is a **beta** version with only a few features.
>
> Please submit issues with your feedback about errors, usability and feature requests.

> sfdx plugin for generating a package.xml manifest

[![Actions Status](https://github.com/amtrack/sfdx-plugin-package-xml/workflows/Test%20and%20Release/badge.svg)](https://github.com/amtrack/sfdx-plugin-package-xml/actions)

## Installation

```console
sfdx plugins:install sfdx-plugin-package-xml@beta
```

## Usage

Commands

```console
sfdx force:mdapi:listallmetadata -h
sfdx package.xml:generate -h
```

Note: The first command is _force:mdapi:list**all**metadata_ compared to the official _force:mdapi:listmetadata_ command.

## Use Cases

Retrieve all Metadata from an org named `acme-dev` (a.k.a "Metadata Backup", a.k.a. "sfdx force:org:pull")

```console
sfdx force:mdapi:listallmetadata -f /tmp/fileproperties.json -u acme-dev
sfdx package.xml:generate -j /tmp/fileproperties.json -f package.xml
sfdx force:source:retrieve -x package.xml -u acme-dev
```

Explore Metadata in an org named `acme-dev`

```console
sfdx force:mdapi:listallmetadata --names -u acme-dev
# include child Metadata such as CustomField and filter for CustomFields on Account
sfdx force:mdapi:listallmetadata --children --names -u acme-dev | grep "CustomField:Account."
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

- output of `sfdx force:mdapi:listallmetadata --names`
- component names (allow rules) in `sfdx force:mdapi:listallmetadata --metadata`
- ignore rules in `sfdx force:mdapi:listallmetadata --ignore` and `sfdx package.xml:generate --ignore`

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
sfdx force:mdapi:listallmetadata -m "CustomObject" --managed --unlocked --names
sfdx force:mdapi:listallmetadata -m "CustomObject" --no-unmanaged --names
```

2. To list CustomObjects **except** the ones belonging to a Managed Package OR Unlocked Package:

```console
sfdx force:mdapi:listallmetadata -m "CustomObject" --unmanaged --names
sfdx force:mdapi:listallmetadata -m "CustomObject" --no-managed --no-unlocked --names
```

### Package.xml

The `package.xml` file follows a certain format (indentation, sort order).
You can discover this when using an unformatted `package.xml` to retrieve Metadata.
The returned zip file contains a well formatted `package.xml`.
We try to stick to this format to make working with version control systems more easy.
