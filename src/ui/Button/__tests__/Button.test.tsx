import { fireEvent, screen } from '@testing-library/react'
import { Button } from '@ui/Button'
import { describe, expect, it, vi } from 'vitest'

import { render } from '../../../test/utils'

describe('Button', () => {
  it('should render with children', () => {
    render(<Button>Test Button</Button>)
    
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByText('Test Button')).toBeInTheDocument()
  })

  it('should apply primary variant by default', () => {
    render(<Button>Test</Button>)
    
    const button = screen.getByRole('button')
    expect(button.className).toMatch(/button/)
    expect(button.className).toMatch(/primary/)
  })

  it('should apply specified variant', () => {
    render(<Button variant="secondary">Test</Button>)
    
    const button = screen.getByRole('button')
    expect(button.className).toMatch(/button/)
    expect(button.className).toMatch(/secondary/)
  })

  it('should apply fullWidth class when fullWidth is true', () => {
    render(<Button fullWidth>Test</Button>)
    
    const button = screen.getByRole('button')
    expect(button.className).toMatch(/fullWidth/)
  })

  it('should apply disabled class and attribute when disabled', () => {
    render(<Button disabled>Test</Button>)
    
    const button = screen.getByRole('button')
    expect(button.className).toMatch(/disabled/)
    expect(button).toBeDisabled()
  })

  it('should apply custom className', () => {
    render(<Button className="custom-class">Test</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('should handle click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Test</Button>)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should not trigger click when disabled', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick} disabled>Test</Button>)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('should forward HTML button attributes', () => {
    render(<Button type="submit" form="test-form">Test</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'submit')
    expect(button).toHaveAttribute('form', 'test-form')
  })

  describe('variants', () => {
    const variants = ['primary', 'secondary', 'download', 'upload', 'clear'] as const

    variants.forEach(variant => {
      it(`should render ${variant} variant correctly`, () => {
        render(<Button variant={variant}>Test</Button>)
        
        const button = screen.getByRole('button')
        expect(button.className).toMatch(/button/)
        expect(button.className).toMatch(new RegExp(variant))
      })
    })
  })
})
