import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import PackageXml, {
  compareAlphanumeric,
  comparePackageXmlProperties
} from '../src/package-xml';
import * as destructiveChanges from './fixtures/package/destructiveChanges.json';
import * as managedPackage from './fixtures/package/managedPackage.json';
import * as simplePackage from './fixtures/package/package.json';

describe('PackageXml', () => {
  describe('#toString()', () => {
    it('should return the xml representation of a package', () => {
      const expectedXml = fs
        .readFileSync(
          path.resolve(__dirname, 'fixtures', 'package', 'package.xml')
        )
        .toString();
      const p = new PackageXml(simplePackage.components, simplePackage.meta);
      expect(p.toString()).to.deep.equal(expectedXml);
    });
    it('should return the xml representation of a managed package', () => {
      const expectedXml = fs
        .readFileSync(
          path.resolve(__dirname, 'fixtures', 'package', 'managedPackage.xml')
        )
        .toString();
      const p = new PackageXml(managedPackage.components, managedPackage.meta);
      expect(p.toString()).to.deep.equal(expectedXml);
    });
    it('should return the xml representation of a destructive changes package', () => {
      const expectedXml = fs
        .readFileSync(
          path.resolve(
            __dirname,
            'fixtures',
            'package',
            'destructiveChanges.xml'
          )
        )
        .toString();
      const p = new PackageXml(
        destructiveChanges.components,
        destructiveChanges.meta
      );
      expect(p.toString()).to.deep.equal(expectedXml);
    });
  });
  describe('compareAlphanumeric()', () => {
    it('should sort as expected', () => {
      expect(['a', 'c', 'b', 'c'].sort(compareAlphanumeric)).to.deep.equal([
        'a',
        'b',
        'c',
        'c'
      ]);
    });
  });
  describe('comparePackageXmlProperties()', () => {
    it('should sort as expected', () => {
      expect(
        [
          'apiAccessLevel',
          'fullName',
          'types',
          'version',
          'namespacePrefix'
        ].sort(comparePackageXmlProperties)
      ).to.deep.equal([
        'fullName',
        'apiAccessLevel',
        'namespacePrefix',
        'types',
        'version'
      ]);
    });
  });
});
