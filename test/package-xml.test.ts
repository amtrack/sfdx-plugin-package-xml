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
  describe('PackageXml()', () => {
    it('constructor should work like an Array', () => {
      const p = new PackageXml(
        { type: 'foo', fullName: 'TestA' },
        { type: 'foo', fullName: 'TestB' }
      );
      expect(p.map((component) => component.fullName)).to.deep.equal([
        'TestA',
        'TestB'
      ]);
      expect(
        p.filter((component) => component.fullName === 'TestA')
      ).to.deep.equal([{ type: 'foo', fullName: 'TestA' }]);
      p.push({ type: 'foo', fullName: 'TestC' });
      expect(p.length).to.equal(3);
      const p2 = new PackageXml(...p);
      expect(p2.constructor === PackageXml);
    });
  });
  describe('#toString()', () => {
    it('should return the xml representation of a package', () => {
      const expectedXml = fs
        .readFileSync(
          path.resolve(__dirname, 'fixtures', 'package', 'package.xml')
        )
        .toString();
      const p = PackageXml.create(simplePackage.components, simplePackage.meta);
      expect(p.toString()).to.deep.equal(expectedXml);
    });
    it('should return the xml representation of a managed package', () => {
      const expectedXml = fs
        .readFileSync(
          path.resolve(__dirname, 'fixtures', 'package', 'managedPackage.xml')
        )
        .toString();
      const p = PackageXml.create(
        managedPackage.components,
        managedPackage.meta
      );
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
      const p = PackageXml.create(
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
