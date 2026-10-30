import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { Grid3x3Page } from '../src/features/magazine/components/Grid3x3Page';
import { Grid2x3Page } from '../src/features/magazine/components/Grid2x3Page';
import { ShowcaseHoneyPage } from '../src/features/magazine/components/ShowcaseHoneyPage';
import { ShowcaseFoodPage } from '../src/features/magazine/components/ShowcaseFoodPage';
import { GridCustomPage } from '../src/features/magazine/components/GridCustomPage';
import issueData from '../data/live_issue.json';

describe('Magazine Page Components', () => {
  it('renders ShowcaseHoneyPage for page 1', () => {
    const page1 = issueData.pages[0];
    const { getAllByText } = render(
      <ShowcaseHoneyPage
        slots={page1.slots}
        pageNumber={1}
        sectionTitle={page1.sectionTitle}
      />
    );
    expect(getAllByText(/عسل نحلة/).length).toBeGreaterThan(0);
    expect(getAllByText(/حقيبة من الحلفا/).length).toBeGreaterThan(0);
  });

  it('renders ShowcaseFoodPage for page 2', () => {
    const page2 = issueData.pages[1];
    const { getAllByText } = render(
      <ShowcaseFoodPage
        slots={page2.slots}
        pageNumber={2}
        sectionTitle={page2.sectionTitle}
      />
    );
    expect(getAllByText(/تمور نخلة/).length).toBeGreaterThan(0);
    expect(getAllByText(/واج زيت زيتون/).length).toBeGreaterThan(0);
  });

  it('renders Grid2x3Page with 6 slots', () => {
    const page12 = issueData.pages[11]; // Page 12
    const { container } = render(
      <Grid2x3Page
        pageNumber={12}
        sectionTitle={page12.sectionTitle}
        slots={page12.slots}
      />
    );
    const cards = container.querySelectorAll('.product-card');
    expect(cards.length).toBe(6);
  });

  it('renders GridCustomPage for 4-card layout (page 47)', () => {
    const page47 = issueData.pages[46]; // Page 47
    const { container } = render(
      <GridCustomPage
        pageNumber={47}
        sectionTitle={page47.sectionTitle}
        slots={page47.slots}
        template="grid2x2"
      />
    );
    const cards = container.querySelectorAll('.product-card');
    expect(cards.length).toBe(4);
  });

  it('renders GridCustomPage for hero-split layout (page 48)', () => {
    const page48 = issueData.pages[47]; // Page 48
    const { container } = render(
      <GridCustomPage
        pageNumber={48}
        sectionTitle={page48.sectionTitle}
        slots={page48.slots}
        template="hero-split"
      />
    );
    const cards = container.querySelectorAll('.product-card');
    expect(cards.length).toBe(3);
  });
});
