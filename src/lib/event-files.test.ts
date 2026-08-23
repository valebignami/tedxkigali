import { describe, expect, it } from 'vitest';
import { eventFilesInSubFolders, eventInSubFolderMessage } from '~/lib/event-files';

describe('eventFilesInSubFolders', () => {
  it('finds nothing wrong with the events folder as the CMS writes it', () => {
    expect(eventFilesInSubFolders(['tedxkigali-2026.md', 'tedxkigali-2025.md'])).toEqual([]);
  });

  it('names an event kept in a folder of its own', () => {
    expect(eventFilesInSubFolders(['2027/tedxkigali-2027.md'])).toEqual(['2027/tedxkigali-2027.md']);
  });

  // readdirSync({ recursive: true }) separates with a backslash on Windows and a
  // slash everywhere else, and the message is read by a person either way.
  it('reads a Windows path and writes it back with slashes', () => {
    expect(eventFilesInSubFolders(['2027\\tedxkigali-2027.md'])).toEqual(['2027/tedxkigali-2027.md']);
  });

  it('names a file nested more than one folder down', () => {
    expect(eventFilesInSubFolders(['archive/2027/a.md'])).toEqual(['archive/2027/a.md']);
  });

  // The recursive listing gives the folders themselves as well as the files.
  it('ignores everything that is not a markdown file', () => {
    expect(eventFilesInSubFolders(['2027', '2027/notes.txt', 'tedxkigali-2026.md'])).toEqual([]);
  });
});

describe('eventInSubFolderMessage', () => {
  it('names the file, the folder it is in, and what to do', () => {
    const message = eventInSubFolderMessage('2027/tedxkigali-2027.md');
    expect(message).toContain('tedxkigali-2027.md');
    expect(message).toContain('2027');
    expect(message).toMatch(/maintainer/i);
  });
});
