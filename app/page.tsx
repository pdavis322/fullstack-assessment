"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Product {
  stacklineSku: string;
  title: string;
  categoryName: string;
  subCategoryName: string;
  imageUrls: string[];
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  );
  const [selectedSubCategory, setSelectedSubCategory] = useState<
    string | undefined
  >(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load categories");
        return res.json();
      })
      .then((data) => setCategories(data.categories))
      .catch((err) => console.error(err.message));
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetch(`/api/subcategories?category=${encodeURIComponent(selectedCategory)}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load subcategories");
          return res.json();
        })
        .then((data) => setSubCategories(data.subCategories))
        .catch((err) => console.error(err.message));
    } else {
      setSubCategories([]);
      setSelectedSubCategory(undefined);
    }
  }, [selectedCategory]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedCategory, selectedSubCategory]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (debouncedSearch) params.append("search", debouncedSearch);
    if (selectedCategory) params.append("category", selectedCategory);
    if (selectedSubCategory) params.append("subCategory", selectedSubCategory);
    params.append("limit", String(limit));
    params.append("offset", String((page - 1) * limit));

    fetch(`/api/products?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load products");
        return res.json();
      })
      .then((data) => {
        setProducts(data.products);
        setTotal(data.total);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [debouncedSearch, selectedCategory, selectedSubCategory, page]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold mb-6">StackShop</h1>

          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={selectedCategory ?? "all"}
              onValueChange={(value) => setSelectedCategory(value === "all" ? undefined : value)}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedCategory && subCategories.length > 0 && (
              <Select
                value={selectedSubCategory ?? "all"}
                onValueChange={(value) =>
                  setSelectedSubCategory(value === "all" ? undefined : value)
                }
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="All Subcategories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subcategories</SelectItem>
                  {subCategories.map((subCat) => (
                    <SelectItem key={subCat} value={subCat}>
                      {subCat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {(search || selectedCategory || selectedSubCategory) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory(undefined);
                  setSelectedSubCategory(undefined);
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error ? (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products found</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} products
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link
                  key={product.stacklineSku}
                  href={`/product/${product.stacklineSku}`}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader className="p-0">
                      <div className="relative h-48 w-full overflow-hidden rounded-t-lg bg-muted">
                        {product.imageUrls[0] && (
                          <Image
                            src={product.imageUrls[0]}
                            alt={product.title}
                            fill
                            className="object-contain p-4"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <CardTitle className="text-base line-clamp-2 mb-2">
                        {product.title}
                      </CardTitle>
                      <CardDescription className="flex gap-2 flex-wrap">
                        <Badge variant="secondary">
                          {product.categoryName}
                        </Badge>
                        <Badge variant="outline">
                          {product.subCategoryName}
                        </Badge>
                      </CardDescription>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>

            {total > limit && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {Math.ceil(total / limit)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil(total / limit)}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
